import http from 'http';
import type { AddressInfo } from 'net';
import type { Express } from 'express';

import { initWebSocketServer } from '../websocket/wsServer';

export interface TestServer {
  httpUrl: string;
  wsUrl: string;
  close: () => Promise<void>;
}

/** Starts the real app (routes and WebSocket server) on a random free port. */
export async function startTestServer(app: Express): Promise<TestServer> {
  const server = http.createServer(app);

  initWebSocketServer(server);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address() as AddressInfo;

  return {
    httpUrl: `http://127.0.0.1:${port}`,
    wsUrl: `ws://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        // fetch keeps connections alive, which would otherwise hold close() open
        server.closeAllConnections();
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
