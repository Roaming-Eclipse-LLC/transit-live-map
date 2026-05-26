# Transit Live Map

A real-time transit vehicle tracking application powered by the MBTA GTFS-RT vehicle positions feed. Built with a clean, modular architecture designed for scalability, long-term maintainability, and adaptability to other transit agencies.

---

## Project Goals

- Stream live vehicle locations from a GTFS-RT feed to connected clients
- Build a clean, production-minded codebase — not just a demo script
- Demonstrate separation of concerns across polling, broadcasting, and presentation
- Serve as a portfolio-quality full-stack real-time system
- Provide a reusable template for other city or agency transit maps

---

## Architecture Overview

```
transit-live-map/
├── api/        # Node.js/Express backend — polling, WebSocket broadcasting
└── web/        # React frontend — live map view, WebSocket client
```

The backend and frontend are fully decoupled. The frontend has no knowledge of the backend internals — it only connects to the WebSocket endpoint. This makes it straightforward to swap or add frontends, or adapt the backend to a different transit feed.

```
GTFS-RT Feed (MBTA)
       │
       ▼
  GTFS-RT Poller (every 10s)
       │
       ▼
  Protobuf Decoder (protobufjs)
       │
       ▼
  Normalizer → VehiclePosition
       │
       ▼
  WebSocket Broadcast Layer
       │
       ▼
  React Frontend (MapLibre GL JS)
```

---

## Tech Stack

### API

| Tool                | Purpose                                 |
| ------------------- | --------------------------------------- |
| Node.js             | Runtime                                 |
| Express             | HTTP server                             |
| TypeScript (strict) | Type safety                             |
| protobufjs          | Decode GTFS-RT binary feed              |
| ws                  | Lightweight WebSocket server            |
| dotenv              | Environment variable management         |
| tsx                 | TypeScript dev server (no compile step) |
| ESLint + Prettier   | Linting and formatting                  |

### Web

| Tool           | Purpose                                         |
| -------------- | ----------------------------------------------- |
| React          | UI framework                                    |
| Vite           | Build tool and dev server                       |
| TypeScript     | Type safety                                     |
| MapLibre GL JS | Interactive map rendering (open source)         |
| MapTiler       | Map tile provider (free tier, API key required) |

> **Map tile options:** This project uses [MapTiler](https://maptiler.com) for map tiles by default (free tier, 50,000 requests/month). For a fully open source, no-API-key alternative, [OpenFreeMap](https://openfreemap.org) is supported — swap the style URL in `Map/index.tsx` to `https://tiles.openfreemap.org/styles/liberty`.

### Planned (Phase 2)

| Tool                            | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| Supabase (PostgreSQL + PostGIS) | Vehicle position persistence                |
| Docker                          | Containerization                            |
| Fly.io                          | Hosting — API and web (supports WebSockets) |
| GitHub Actions                  | CI/CD pipeline                              |
| Redis Pub/Sub                   | Horizontal scaling support                  |

---

## Data Source

**MBTA GTFS-RT Vehicle Positions**
`https://cdn.mbta.com/realtime/VehiclePositions.pb`

Polled every 10 seconds. Data is decoded from protobuf binary format using the official GTFS-RT schema and normalized into a consistent internal type before broadcasting.

This app is designed to work with any GTFS-RT compliant feed — the data source URL is configurable via environment variable.

---

## Vehicle Data Shape

Each vehicle broadcast to the frontend:

```ts
{
  id: string         // Vehicle ID
  routeId: string    // Route (e.g. "39", "Red")
  latitude: number
  longitude: number
  bearing?: number   // Direction in degrees (0–360)
  speed?: number     // Meters per second
  timestamp: number  // Unix timestamp
}
```

---

## API Endpoints

| Method | Route                 | Description                           |
| ------ | --------------------- | ------------------------------------- |
| GET    | `/`                   | Root — confirms API is running        |
| GET    | `/health`             | Health check with timestamp           |
| WS     | `ws://localhost:3001` | WebSocket — streams vehicle positions |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- A MapTiler API key ([maptiler.com](https://maptiler.com)) — or use OpenFreeMap for no key required

### 1. Clone the repo

```bash
git clone git@github.com:your-org/transit-live-map.git
cd transit-live-map
```

### 2. Set up the API

```bash
cd api
npm install
cp .env.example .env
# Add your MBTA API key to .env
npm run dev
```

### 3. Set up the web client

```bash
cd web
npm install
cp .env.example .env
# Add your MapTiler API key to .env
npm run dev
```

---

## Environment Variables

### api/.env

```
PORT=3001
POLL_INTERVAL_MS=10000
GTFS_RT_URL=https://cdn.mbta.com/realtime/VehiclePositions.pb
MBTA_API_KEY=your_mbta_api_key_here
```

### web/.env

```
VITE_WS_URL=ws://localhost:3001
VITE_MAPTILER_KEY=your_maptiler_key_here
```

> For OpenFreeMap (no API key needed), remove `VITE_MAPTILER_KEY` and update the style URL in `Map/index.tsx`.

---

## Deployment

The app is deployed on **Fly.io**, which supports persistent WebSocket connections and runs Docker containers directly. Both the `api/` and `web/` are deployed there.

### CI/CD Pipeline (GitHub Actions)

| Trigger            | Steps                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Push to any branch | ESLint, TypeScript check, build                                    |
| Pull Request       | All checks must pass + at least one reviewer approval before merge |
| Merge to `main`    | All checks re-run, then auto-deploy to Fly.io                      |

Direct pushes to `main` are disabled. All changes go through a Pull Request.

---

## Project Status

| Phase                                  | Status         |
| -------------------------------------- | -------------- |
| Project scaffold                       | ✅ Complete    |
| GTFS-RT poller                         | ✅ Complete    |
| WebSocket broadcast                    | ✅ Complete    |
| React frontend — map scaffold          | ✅ Complete    |
| React frontend — WebSocket integration | 🔲 In progress |
| React frontend — bus markers           | 🔲 Not started |
| Supabase persistence                   | 🔲 Not started |
| Docker + Fly.io deployment             | 🔲 Not started |
| GitHub Actions CI/CD                   | 🔲 Not started |

---

## Adapting for Other Transit Agencies

This project is built around the open GTFS-RT standard. To use it with a different transit agency:

1. Update `GTFS_RT_URL` in `.env` to point to the agency's vehicle positions feed
2. Update `MBTA_API_KEY` if the agency requires a different authentication header
3. The rest of the application requires no changes

---

## Future Expansion

- Real-time route filtering
- ETA predictions
- Historical playback
- Mobile-friendly UI
- Redis Pub/Sub for horizontal scaling
- SvelteKit frontend (planned post-completion)
- Possible backend migration to Elixir + Phoenix

---

## License

MIT © Roaming Eclipse LLC
