import path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import protobuf from 'protobufjs';

import { startPoller } from './gtfsPoller';
import type { VehiclePosition } from '../types/vehicle';

const FEED_URL = 'https://feed.test/VehiclePositions.pb';
const POLL_INTERVAL_MS = 10_000;

// Build real GTFS-RT feeds with the same schema file the poller decodes with.
const feedType = protobuf
  .load(path.join(__dirname, 'gtfs-realtime.proto'))
  .then((root) => root.lookupType('transit_realtime.FeedMessage'));

type FeedEntity = { id: string; vehicle?: object };

const encodeFeed = async (entity: FeedEntity[]): Promise<ArrayBuffer> => {
  const FeedMessage = await feedType;
  const payload = { header: { gtfsRealtimeVersion: '2.0' }, entity };
  const problem = FeedMessage.verify(payload);

  if (problem) {
    throw new Error(`Invalid test feed: ${problem}`);
  }

  const bytes = FeedMessage.encode(FeedMessage.fromObject(payload)).finish();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return buffer;
};

const respondWith = (body: ArrayBuffer | string, status = 200) =>
  vi.mocked(fetch).mockResolvedValueOnce(new Response(body, { status }));

// Latitude, longitude, bearing and speed are 32-bit floats in the schema, so
// the values below are ones a float stores exactly (42.5, not 42.3601).
const vehicle = (id: string, routeId = '39') => ({
  id,
  vehicle: {
    trip: { routeId },
    position: { latitude: 42.5, longitude: -71.25, bearing: 90, speed: 12.5 },
    timestamp: 1780791463,
  },
});

const startWith = () => {
  const onUpdate = vi.fn<(vehicles: VehiclePosition[]) => void>();
  startPoller(onUpdate);
  return onUpdate;
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  // Only the interval is faked, so the real file read and decode still run.
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('gtfsPoller', () => {
  it('decodes a real protobuf feed into normalized vehicles', async () => {
    respondWith(await encodeFeed([vehicle('v1')]));

    const onUpdate = startWith();

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(onUpdate).toHaveBeenCalledWith([
      {
        id: 'v1',
        routeId: '39',
        latitude: 42.5,
        longitude: -71.25,
        bearing: 90,
        speed: 12.5,
        timestamp: 1780791463,
      },
    ]);
  });

  it('requests the configured feed with the API key', async () => {
    respondWith(await encodeFeed([vehicle('v1')]));

    const onUpdate = startWith();

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(FEED_URL, {
      headers: { 'x-api-key': 'test-key' },
    });
  });

  it('skips entities that have no vehicle position', async () => {
    respondWith(
      await encodeFeed([
        vehicle('v1'),
        { id: 'alert-only' },
        { id: 'no-position', vehicle: { trip: { routeId: '1' } } },
        vehicle('v2', '1'),
      ]),
    );

    const onUpdate = startWith();

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(onUpdate.mock.calls[0][0].map((v) => v.id)).toEqual(['v1', 'v2']);
  });

  it('uses "unknown" as the route when the vehicle has no trip', async () => {
    respondWith(
      await encodeFeed([
        {
          id: 'v1',
          vehicle: { position: { latitude: 42.5, longitude: -71.25 } },
        },
      ]),
    );

    const onUpdate = startWith();

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(onUpdate.mock.calls[0][0][0].routeId).toBe('unknown');
  });

  describe('fields the feed leaves out', () => {
    const sparseVehicle = {
      id: 'v1',
      vehicle: {
        trip: { routeId: '39' },
        position: { latitude: 42.5, longitude: -71.25 },
      },
    };

    it('reports bearing as undefined, not 0', async () => {
      respondWith(await encodeFeed([sparseVehicle]));

      const onUpdate = startWith();

      await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
      expect(onUpdate.mock.calls[0][0][0].bearing).toBeUndefined();
    });

    it('reports speed as undefined, not 0', async () => {
      respondWith(await encodeFeed([sparseVehicle]));

      const onUpdate = startWith();

      await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
      expect(onUpdate.mock.calls[0][0][0].speed).toBeUndefined();
    });

    it('falls back to the current time when the timestamp is missing', async () => {
      respondWith(await encodeFeed([sparseVehicle]));
      const before = Date.now();

      const onUpdate = startWith();

      await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
      expect(onUpdate.mock.calls[0][0][0].timestamp).toBeGreaterThanOrEqual(
        before,
      );
    });
  });

  it('polls again on every interval', async () => {
    respondWith(await encodeFeed([vehicle('v1')]));
    const onUpdate = startWith();
    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));

    respondWith(await encodeFeed([vehicle('v2')]));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(2));
    expect(onUpdate.mock.calls[1][0].map((v) => v.id)).toEqual(['v2']);
  });

  it('logs a failed poll and recovers on the next interval', async () => {
    respondWith('Forbidden', 403);
    const onUpdate = startWith();

    await vi.waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));
    expect(console.error).toHaveBeenCalledWith(
      'Polling error: ',
      expect.objectContaining({
        message: expect.stringContaining('HTTP error: 403'),
      }),
    );
    expect(onUpdate).not.toHaveBeenCalled();

    respondWith(await encodeFeed([vehicle('v1')]));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
  });

  it('treats a 200 response that is not protobuf as a failed poll', async () => {
    respondWith(
      '<?xml version="1.0"?><Error><Code>AccessDenied</Code></Error>',
    );

    const onUpdate = startWith();

    await vi.waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('keeps a bearing and speed the feed explicitly reports as 0', async () => {
    respondWith(
      await encodeFeed([
        {
          id: 'v1',
          vehicle: {
            trip: { routeId: '39' },
            position: {
              latitude: 42.5,
              longitude: -71.25,
              bearing: 0,
              speed: 0,
            },
            timestamp: 1780791463,
          },
        },
      ]),
    );

    const onUpdate = startWith();

    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(onUpdate.mock.calls[0][0][0]).toEqual(
      expect.objectContaining({ bearing: 0, speed: 0 }),
    );
  });
});
