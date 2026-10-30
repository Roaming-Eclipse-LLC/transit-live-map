import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

export const clients: Set<WebSocket> = new Set();

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
