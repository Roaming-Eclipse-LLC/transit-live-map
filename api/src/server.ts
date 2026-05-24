import express from 'express';
import http from 'http';
import dotenv from 'dotenv';

import { startPoller } from './poller/gtfsPoller';
import { initWebSocketServer, broadcastVehicles } from './websocket/wsServer';
import { VehiclePosition } from './types/vehicle';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const server = http.createServer(app);

initWebSocketServer(server);

/** Root endpoint — confirms the API is reachable. */
app.get('/', (_req, res) => {
    res.json({
        message: 'Transit Live Map API is running'
    });
});

/** Health check endpoint — returns current server status and timestamp for uptime monitoring. */
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

/** Starts the HTTP server and kicks off the GTFS-RT poller once the port is bound. */
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)

    startPoller((vehicles: VehiclePosition[]) => {
        broadcastVehicles(vehicles);
    });
});

export default app;
