# transit-live-map / web

React frontend for the Transit Live Map application. Connects to the API via WebSocket and renders live vehicle positions on an interactive map.

## Tech Stack

- React + TypeScript
- Vite
- MapLibre GL JS
- MapTiler (map tiles)
- SCSS Modules

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

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server         |
| `npm run build`   | Production build                 |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |
