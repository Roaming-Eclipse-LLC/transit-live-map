import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocket } from 'ws';

import { broadcastVehicles, clients, sendLatestTo } from './broadcast';
import type { VehiclePosition } from '../types/vehicle';

const mockVehicles: VehiclePosition[] = [
  {
    id: 'v1',
    routeId: '39',
    latitude: 42.3601,
    longitude: -71.0589,
    bearing: 90,
    speed: 10,
    timestamp: 1234567890,
  },
];

const mockClient = (readyState: number) =>
  ({
    readyState,
    send: vi.fn(),
  }) as unknown as WebSocket;

beforeEach(() => {
  clients.clear();
  broadcastVehicles([]); // resets the cache, since sendLatestTo skips empty data
});

describe('broadcastVehicles', () => {
  it('sends serialized vehicle data to open clients', () => {
    const client = mockClient(WebSocket.OPEN);
    clients.add(client);

    broadcastVehicles(mockVehicles);

    expect(client.send).toHaveBeenCalledWith(JSON.stringify(mockVehicles));
  });

  it('does not send to clients that are not open', () => {
    const client = mockClient(WebSocket.CLOSED);
    clients.add(client);

    broadcastVehicles(mockVehicles);

    expect(client.send).not.toHaveBeenCalled();
  });

  it('sends to multiple open clients', () => {
    const client1 = mockClient(WebSocket.OPEN);
    const client2 = mockClient(WebSocket.OPEN);
    clients.add(client1);
    clients.add(client2);

    broadcastVehicles(mockVehicles);

    expect(client1.send).toHaveBeenCalledWith(JSON.stringify(mockVehicles));
    expect(client2.send).toHaveBeenCalledWith(JSON.stringify(mockVehicles));
  });

  it('does nothing when there are no clients', () => {
    expect(() => broadcastVehicles(mockVehicles)).not.toThrow();
  });

  it('sends an empty array correctly', () => {
    const client = mockClient(WebSocket.OPEN);
    clients.add(client);

    broadcastVehicles([]);

    expect(client.send).toHaveBeenCalledWith('[]');
  });
});

describe('sendLatestTo', () => {
  it('sends the most recent vehicles to a newly connected client', () => {
    broadcastVehicles(mockVehicles);
    const client = mockClient(WebSocket.OPEN);

    sendLatestTo(client);

    expect(client.send).toHaveBeenCalledWith(JSON.stringify(mockVehicles));
  });

  it('sends the newest snapshot when several polls have run', () => {
    const newer = [{ ...mockVehicles[0], id: 'v2' }];
    broadcastVehicles(mockVehicles);
    broadcastVehicles(newer);
    const client = mockClient(WebSocket.OPEN);

    sendLatestTo(client);

    expect(client.send).toHaveBeenCalledTimes(1);
    expect(client.send).toHaveBeenCalledWith(JSON.stringify(newer));
  });

  it('sends nothing before the first poll has run', () => {
    const client = mockClient(WebSocket.OPEN);

    sendLatestTo(client);

    expect(client.send).not.toHaveBeenCalled();
  });

  it('sends nothing to a client that is not open', () => {
    broadcastVehicles(mockVehicles);
    const client = mockClient(WebSocket.CLOSED);

    sendLatestTo(client);

    expect(client.send).not.toHaveBeenCalled();
  });
});
