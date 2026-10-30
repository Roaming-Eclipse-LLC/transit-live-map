import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocket } from 'ws';

import { broadcastVehicles, clients } from './broadcast';
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
