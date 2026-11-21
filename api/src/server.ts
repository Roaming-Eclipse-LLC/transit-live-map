import 'dotenv/config';
import http from 'http';

import { createApp } from './app';
import { startPoller } from './poller/gtfsPoller';
import { initWebSocketServer } from './websocket/wsServer';
import { broadcastVehicles } from './websocket/broadcast';

const PORT = process.env.PORT ?? 3001;

const server = http.createServer(createApp());

initWebSocketServer(server);

/** Starts the HTTP server and kicks off the GTFS-RT poller once the port is bound. */
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  startPoller(broadcastVehicles);
});
