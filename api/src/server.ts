import express from 'express';
import dotenv from 'dotenv';

import { VehiclePosition } from './types/vehicle';
import { startPoller } from './poller/gtfsPoller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

let latestVehicles: VehiclePosition[] = [];

app.get('/', (_req, res) => {
    res.json({
        message: 'Transit Live Map API is running'
    });
});

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)

    startPoller((vehicles: VehiclePosition[]) => {
        latestVehicles = vehicles;
    });
});

export default app;
