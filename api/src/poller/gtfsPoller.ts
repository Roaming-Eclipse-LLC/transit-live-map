import protobuf from 'protobufjs';
import path from 'path';

import type { VehiclePosition } from '../types/vehicle';
import type { GtfsFeedMessage } from '../types/gtfs';
import { hasPosition, normalizeVehicle } from '../utils/normalizeVehicle';

const GTFS_RT_URL =
  process.env.GTFS_RT_URL ??
  'https://cdn.mbta.com/realtime/VehiclePositions.pb';

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '10000', 10);

let root: protobuf.Root | null = null;

/** Lazily loads and caches the GTFS-RT protobuf schema, returning the FeedMessage type. */
async function loadProto(): Promise<protobuf.Type> {
  if (!root) {
    root = await protobuf.load(path.join(__dirname, 'gtfs-realtime.proto'));
  }

  return root.lookupType('transit_realtime.FeedMessage');
}

/** Fetches the GTFS-RT binary feed, decodes it via protobuf, and maps entities to VehiclePositions. */
async function fetchVehiclePositions(): Promise<VehiclePosition[]> {
  const FeedMessage = await loadProto();

  const response = await fetch(GTFS_RT_URL, {
    headers: {
      'x-api-key': process.env.MBTA_API_KEY ?? '',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error: ${response.status} - ${text}`);
  }

  const buffer = await response.arrayBuffer();
  const message = FeedMessage.decode(new Uint8Array(buffer));

  // toObject copies only the fields the feed actually sent. A plain decoded
  // message reports missing numeric fields as 0 (the protobuf default), which
  // turns an unknown bearing or speed into a real-looking zero.
  const decoded = FeedMessage.toObject(message, {
    longs: Number,
    arrays: true,
  }) as unknown as GtfsFeedMessage;

  return decoded.entity.filter(hasPosition).map(normalizeVehicle);
}

/** Runs an immediate poll then schedules repeated fetches at POLL_INTERVAL_MS, invoking onUpdate with each result. */
export function startPoller(
  onUpdate: (vehicles: VehiclePosition[]) => void,
): void {
  const poll = async () => {
    try {
      const vehicles = await fetchVehiclePositions();

      console.log(`Polled ${vehicles.length} vehicles`);

      onUpdate(vehicles);
    } catch (err) {
      console.error('Polling error: ', err);
    }
  };

  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}
