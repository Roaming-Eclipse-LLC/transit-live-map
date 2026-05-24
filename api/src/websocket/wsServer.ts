import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

import { VehiclePosition } from '../types/vehicle';

const clients: Set<WebSocket> = new Set();

/** Attaches a WebSocket server to the existing HTTP server and manages the client registry. */
export function initWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log(`Client connected. Total clients: ${clients.size}`);

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`Client disconnected. Total clients: ${clients.size}`);
    });

    ws.on('error', (err: Error) => {
      // Log error first before removing the client to ensure we capture the error details
      console.error(`WebSocket error: ${err}`);
      clients.delete(ws);
    });
  });
}

/** Serializes vehicle positions and pushes them to all currently connected clients. */
export function broadcastVehicles(vehicles: VehiclePosition[]): void {
  const payload = JSON.stringify(vehicles);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
