# transit-live-map / api

Node.js/Express backend for the Transit Live Map application. Polls the MBTA GTFS-RT vehicle positions feed, decodes protobuf binary data, and broadcasts normalized vehicle positions to connected WebSocket clients.

## Tech Stack

- Node.js + Express
- TypeScript (strict)
- protobufjs — GTFS-RT protobuf decoding
- ws — WebSocket server
- dotenv — environment variable management
- tsx — TypeScript dev server

## Getting Started

```bash
npm install
cp .env.example .env
# Add your MBTA API key to .env
npm run dev
```

## Environment Variables

```
PORT=3001
POLL_INTERVAL_MS=10000
GTFS_RT_URL=https://cdn.mbta.com/realtime/VehiclePositions.pb
MBTA_API_KEY=your_mbta_api_key_here
```

## Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript         |
| `npm run start` | Run compiled production build            |
| `npm run lint`  | Run ESLint                               |

## Endpoints

| Method | Route                 | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/`                   | Root — confirms API is running |
| GET    | `/health`             | Health check with timestamp    |
| WS     | `ws://localhost:3001` | Streams live vehicle positions |

## Architecture

```
src/
├── poller/
│   ├── gtfs-realtime.proto  # Official GTFS-RT schema
│   └── gtfsPoller.ts        # GTFS-RT polling and protobuf decoding
├── types/
│   ├── gtfs.ts              # Raw GTFS-RT types
│   └── vehicle.ts           # VehiclePosition interface
├── utils/
│   └── convertLong.ts       # protobufjs Long to number conversion
├── websocket/
│   └── wsServer.ts          # WebSocket server and broadcast logic
└── server.ts                # Express server entry point
```
