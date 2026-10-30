import { WebSocket } from 'ws';

import type { VehiclePosition } from '../types/vehicle';

export const clients: Set<WebSocket> = new Set();

export function broadcastVehicles(vehicles: VehiclePosition[]): void {
  const payload = JSON.stringify(vehicles);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
