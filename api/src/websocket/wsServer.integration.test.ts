import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WebSocket } from 'ws';

import { createApp } from '../app';
import { startTestServer, type TestServer } from '../test/startTestServer';
import { broadcastVehicles, clients } from './broadcast';
import type { VehiclePosition } from '../types/vehicle';

const vehicleA: VehiclePosition = {
  id: 'v1',
  routeId: '39',
  latitude: 42.3601,
  longitude: -71.0589,
  bearing: 90,
  speed: 10,
  timestamp: 1780791463,
};

const vehicleB: VehiclePosition = { ...vehicleA, id: 'v2', routeId: '1' };

let testServer: TestServer;
const openClients: WebSocket[] = [];

beforeAll(async () => {
  testServer = await startTestServer(createApp());
});

afterAll(async () => {
  await testServer.close();
});

beforeEach(() => {
  // reset the latest-snapshot cache so tests don't leak into each other
  broadcastVehicles([]);
});

afterEach(async () => {
  openClients.forEach((client) => client.terminate());
  openClients.length = 0;

  await vi.waitFor(() => expect(clients.size).toBe(0));
});

/** Opens a real WebSocket connection and records every payload it receives. */
const connect = async () => {
  const client = new WebSocket(testServer.wsUrl);
  const messages: VehiclePosition[][] = [];

  client.on('message', (data) => {
    messages.push(JSON.parse(data.toString()) as VehiclePosition[]);
  });
  openClients.push(client);

  await new Promise<void>((resolve, reject) => {
    client.once('open', resolve);
    client.once('error', reject);
  });

  return { client, messages };
};

describe('WebSocket server', () => {
  it('sends the latest snapshot as soon as a client connects', async () => {
    broadcastVehicles([vehicleA]);

    const { messages } = await connect();

    await vi.waitFor(() => expect(messages).toEqual([[vehicleA]]));
  });

  it('delivers each new broadcast to a connected client', async () => {
    const { messages } = await connect();
    await vi.waitFor(() => expect(clients.size).toBe(1));

    broadcastVehicles([vehicleA]);
    broadcastVehicles([vehicleB]);

    await vi.waitFor(() => expect(messages).toEqual([[vehicleA], [vehicleB]]));
  });

  it('delivers broadcasts to every connected client', async () => {
    const first = await connect();
    const second = await connect();
    await vi.waitFor(() => expect(clients.size).toBe(2));

    broadcastVehicles([vehicleA]);

    await vi.waitFor(() => {
      expect(first.messages).toEqual([[vehicleA]]);
      expect(second.messages).toEqual([[vehicleA]]);
    });
  });

  it('removes a client from the registry when it disconnects', async () => {
    const { client } = await connect();
    await vi.waitFor(() => expect(clients.size).toBe(1));

    client.close();

    await vi.waitFor(() => expect(clients.size).toBe(0));
  });

  it('keeps serving the remaining clients after one disconnects', async () => {
    const leaving = await connect();
    const staying = await connect();
    await vi.waitFor(() => expect(clients.size).toBe(2));

    leaving.client.close();
    await vi.waitFor(() => expect(clients.size).toBe(1));

    broadcastVehicles([vehicleA]);

    await vi.waitFor(() => expect(staying.messages).toEqual([[vehicleA]]));
    expect(leaving.messages).toEqual([]);
  });
});
