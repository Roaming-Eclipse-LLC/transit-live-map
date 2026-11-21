import { WebSocket } from 'ws';

import type { VehiclePosition } from '../types/vehicle';

export const clients: Set<WebSocket> = new Set();

let latestVehicles: VehiclePosition[] = [];

export function broadcastVehicles(vehicles: VehiclePosition[]): void {
  latestVehicles = vehicles;

  const payload = JSON.stringify(vehicles);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function sendLatestTo(client: WebSocket): void {
  if (latestVehicles.length > 0 && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(latestVehicles));
  }
}
