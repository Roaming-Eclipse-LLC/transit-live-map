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

| Method | Route                 | Description                                                                           |
| ------ | --------------------- | ------------------------------------------------------------------------------------- |
| GET    | `/`                   | Root — confirms API is running                                                        |
| GET    | `/health`             | Health check with timestamp                                                           |
| WS     | `ws://localhost:3001` | Streams live vehicle positions; a new client immediately receives the latest snapshot |

## Rate Limiting

HTTP endpoints are rate limited to **25 requests per 5 minutes** per IP. Exceeding this returns a `429 Too Many Requests` response. WebSocket connections are not rate limited.

The API sets `trust proxy` to `1` so the limit applies to each visitor's IP address behind Fly.io's proxy, not to the proxy itself.

## Testing

Tests use Vitest and live next to the source files they cover. Config is in `vitest.config.mts`.

- **Unit tests** (`*.test.ts`) test one module in isolation, with its dependencies faked.
- **Integration tests** (`*.integration.test.ts`) start the real app and WebSocket server on a random port and talk to it with `fetch` and a real `ws` client. They cover the HTTP routes, security headers, rate limiting (including per-visitor counting behind the proxy) and the WebSocket connect, broadcast and disconnect flow.

Run only the integration tests with `npx vitest run integration`.

Coverage thresholds are **80%** for statements, branches, functions and lines.

Two files are excluded from coverage because they are infrastructure glue that still needs integration tests (server startup, and the network fetch and protobuf decode path):

- `src/server.ts`
- `src/poller/gtfsPoller.ts`

## Deployment

The API is deployed on **Fly.io** using Docker.

Production URL: `https://transit-live-map-api.fly.dev`

### Automatic deploys

Merging to `main` deploys the API when anything under `api/` changes. The `Deploy API` workflow (`.github/workflows/deploy-api.yml`) runs `flyctl deploy --remote-only` from the `api/` folder and authenticates with a deploy token stored as the `FLY_API_TOKEN` repository secret. To run it by hand, use **Actions → Deploy API → Run workflow**.

To create or rotate the token, run this from `api/`:

```bash
fly tokens create deploy -x 999999h
```

Save the full output, including the `FlyV1 ` prefix, as `FLY_API_TOKEN` under **Settings → Secrets and variables → Actions**.

### Manual deploy

```bash
cd api
fly deploy
```

Check a deploy with `fly releases --app transit-live-map-api`.

### Runtime configuration

Environment variables are managed via Fly.io secrets:

```bash
fly secrets set MBTA_API_KEY=your_key_here
fly secrets set GTFS_RT_URL=https://cdn.mbta.com/realtime/VehiclePositions.pb
```

```
src/
├── middleware/
│   ├── rateLimiter.test.ts
│   └── rateLimiter.ts       # Express rate limiting middleware
├── poller/
│   ├── gtfs-realtime.proto  # Official GTFS-RT schema
│   └── gtfsPoller.ts        # GTFS-RT polling and protobuf decoding
├── test/
│   └── startTestServer.ts   # Test helper: app and WebSocket server on a random port
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
│   ├── broadcast.ts         # Client registry, broadcasting and latest-snapshot cache
│   ├── wsServer.integration.test.ts
│   └── wsServer.ts          # WebSocket server and connection lifecycle
├── app.integration.test.ts
├── app.ts                   # createApp(): Express app, middleware and routes
└── server.ts                # Entry point: starts the HTTP server, WebSocket server and poller
```

## Future Improvements

- Integration tests (real WebSocket server/client, HTTP routes with supertest, protobuf decode path)
- Gate deploys on the test workflow
- WebSocket authentication (post-MVP)
- Per-IP WebSocket rate limiting
- Redis Pub/Sub for horizontal scaling
- Poller integration test (a real protobuf-encoded feed, with only `fetch` mocked), which removes the last coverage exclusion
