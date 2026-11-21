import express, { type Express } from 'express';
import helmet from 'helmet';

import { rateLimiter } from './middleware/rateLimiter';

/** Builds the Express app: security headers, JSON parsing, rate limiting and routes. */
export function createApp(): Express {
  const app = express();

  // Fly.io's proxy sits in front of the app. Trust one hop so req.ip is the visitor's address.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(express.json());
  app.use(rateLimiter);

  /** Root endpoint — confirms the API is reachable. */
  app.get('/', (_req, res) => {
    res.json({ message: 'Transit Live Map API is running' });
  });

  /** Health check endpoint — returns current server status and timestamp for uptime monitoring. */
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
