# transit-live-map / api

Node.js/Express backend for the Transit Live Map application. Polls the MBTA GTFS-RT vehicle positions feed, decodes protobuf binary data, and broadcasts normalized vehicle positions to connected WebSocket clients.

## Tech Stack

- Node.js + Express
- TypeScript (strict)
- protobufjs — GTFS-RT protobuf decoding
- ws — WebSocket server
- dotenv — environment variable management
- tsx — TypeScript dev server
- express-rate-limit — HTTP endpoint rate limiting
- Helmet — HTTP security headers
- Lefthook — git hooks (pre-commit linting, pre-push branch name validation)
- Vitest — unit testing and coverage

## Getting Started

```bash
npm install
cp .env.example .env
# Add your MBTA API key to .env
npm run dev
```

> **For larger teams or contract deployments:** consider using [Doppler](https://doppler.com) or [Infisical](https://infisical.com) for shared secret management across environments.

## Environment Variables

```
PORT=3001
POLL_INTERVAL_MS=10000
GTFS_RT_URL=https://cdn.mbta.com/realtime/VehiclePositions.pb
MBTA_API_KEY=your_mbta_api_key_here
```

## Scripts

| Command                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Start development server with hot reload              |
| `npm run build`         | Compile TypeScript and copy the `.proto` into `dist/` |
| `npm run start`         | Run compiled production build                         |
| `npm run lint`          | Run ESLint                                            |
| `npm test`              | Run unit tests once                                   |
| `npm run test:watch`    | Run tests in watch mode with coverage                 |
| `npm run test:coverage` | Run tests once and enforce coverage thresholds        |

## Endpoints

| Method | Route                 | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/`                   | Root — confirms API is running |
| GET    | `/health`             | Health check with timestamp    |
| WS     | `ws://localhost:3001` | Streams live vehicle positions |

## Rate Limiting

HTTP endpoints are rate limited to **25 requests per 5 minutes** per IP. Exceeding this returns a `429 Too Many Requests` response. WebSocket connections are not rate limited.

## Testing

Unit tests use Vitest. They live next to the source files they cover (`*.test.ts`), and config is in `vitest.config.mts`.

Coverage thresholds are **80%** for statements, branches, functions and lines.

Three files are excluded from coverage because they are infrastructure glue (server startup, network fetch and protobuf decode, WebSocket connection lifecycle) and are better covered by integration tests:

- `src/server.ts`
- `src/poller/gtfsPoller.ts`
- `src/websocket/wsServer.ts`

## Deployment

The API is deployed on **Fly.io** using Docker.

Production URL: `https://transit-live-map-api.fly.dev`

To deploy manually:

```bash
fly deploy
```

Environment variables are managed via Fly.io secrets:

```bash
fly secrets set MBTA_API_KEY=your_key_here
fly secrets set GTFS_RT_URL=https://cdn.mbta.com/realtime/VehiclePositions.pb
```

## Architecture

```
src/
├── middleware/
│   ├── rateLimiter.test.ts
│   └── rateLimiter.ts       # Express rate limiting middleware
├── poller/
│   ├── gtfs-realtime.proto  # Official GTFS-RT schema
│   └── gtfsPoller.ts        # GTFS-RT polling and protobuf decoding
├── types/
│   ├── gtfs.ts              # Raw GTFS-RT types
│   └── vehicle.ts           # VehiclePosition interface
├── utils/
│   ├── convertLong.test.ts
│   ├── convertLong.ts       # protobufjs Long to number conversion
│   ├── normalizeVehicle.test.ts
│   └── normalizeVehicle.ts  # Raw GTFS entity to VehiclePosition
├── websocket/
│   ├── broadcast.test.ts
│   ├── broadcast.ts         # Client registry and vehicle broadcasting
│   └── wsServer.ts          # WebSocket server and connection lifecycle
└── server.ts                # Express server entry point
```

## Future Improvements

- Integration tests (real WebSocket server/client, HTTP routes with supertest, protobuf decode path)
- WebSocket authentication (post-MVP)
- Per-IP WebSocket rate limiting
- Redis Pub/Sub for horizontal scaling
