# transit-live-map / web

React frontend for the Transit Live Map application. Connects to the API via WebSocket and renders live vehicle positions on an interactive map.

## Tech Stack

- React + TypeScript
- Vite
- MapLibre GL JS
- MapTiler (map tiles)
- SCSS Modules
- React Router: client-side routing
- Vitest + React Testing Library: unit and component tests

MapLibre v6 needs an explicit worker URL under Vite, set in `components/Map/index.tsx` with `setWorkerUrl` and a `?worker&url` import.

## Getting Started

```bash
npm install
cp .env.example .env
# Add your MapTiler API key to .env
npm run dev
```

## Environment Variables

```
VITE_WS_URL=ws://localhost:3001
VITE_MAPTILER_KEY=your_maptiler_key_here
```

## Development Modes

**Running with local API** — default setup, requires the API server running locally:

```
VITE_WS_URL=ws://localhost:3001
```

**Running with live API** — frontend only, no local API needed:

```
VITE_WS_URL=wss://transit-live-map-api.fly.dev
```

Create a `web/.env.development` file with the live API URL if you want to develop the frontend without running the API locally. You'll still need to add your `VITE_MAPTILER_KEY`.

> **For larger teams or contract deployments:** consider using [Doppler](https://doppler.com) or [Infisical](https://infisical.com) for shared secret management, or use `vercel env pull` to pull environment variables directly from Vercel to your local machine.

## Testing

Tests use Vitest and React Testing Library in a jsdom environment. They live next to the code they cover (`*.test.ts`, `*.test.tsx`), and config is in `vite.config.ts`.

Coverage thresholds are **80%** for statements, branches, functions and lines.

- jsdom has no WebGL or canvas, so `maplibre-gl`, `useVehicles` (WebSocket) and `createArrowImage` are replaced with fakes in the component tests.
- Test env values (`VITE_MAPTILER_KEY`, `VITE_WS_URL`) are set in `vite.config.ts`, so tests don't need a `.env` file.
- Unit tests can't catch real MapLibre or worker failures. Check the map with `npm run build && npm run preview`.

## Scripts

| Command                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start development server                       |
| `npm run build`         | Production build                               |
| `npm run preview`       | Preview production build locally               |
| `npm run lint`          | Run ESLint                                     |
| `npm test`              | Run unit tests once                            |
| `npm run test:watch`    | Run tests in watch mode with coverage          |
| `npm run test:coverage` | Run tests once and enforce coverage thresholds |
