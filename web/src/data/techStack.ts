import type { TechSection } from '../types/techStack';

export const techStackSections: TechSection[] = [
  {
    title: 'Frontend',
    items: [
      { name: 'React', description: 'UI framework' },
      { name: 'TypeScript', description: 'Type safety (strict mode)' },
      { name: 'Vite', description: 'Build tool & dev server' },
      { name: 'React Router', description: 'Client-side routing' },
      { name: 'MapLibre GL JS', description: 'Interactive map rendering' },
      { name: 'MapTiler', description: 'Map tile provider' },
      { name: 'SCSS Modules', description: 'Scoped component styling' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'Node.js', description: 'JavaScript runtime' },
      { name: 'Express', description: 'HTTP server framework' },
      { name: 'TypeScript', description: 'Type safety (strict mode)' },
      { name: 'protobufjs', description: 'GTFS-RT protobuf decoding' },
      { name: 'ws', description: 'WebSocket server' },
      { name: 'express-rate-limit', description: 'API rate limiting' },
      { name: 'dotenv', description: 'Environment configuration' },
      { name: 'tsx', description: 'TypeScript dev runtime' },
    ],
  },
  {
    title: 'Deployment & Infrastructure',
    items: [
      { name: 'Docker', description: 'Containerized backend' },
      { name: 'Fly.io', description: 'Backend hosting (WebSockets)' },
      { name: 'Vercel', description: 'Frontend hosting & CI' },
      { name: 'GitHub Actions', description: 'CI/CD pipeline' },
      { name: 'GitHub', description: 'Version control & PR workflow' },
      { name: 'Dependabot', description: 'Automated dependency updates' },
    ],
  },
  {
    title: 'Tooling & Quality',
    items: [
      { name: 'ESLint', description: 'Code linting' },
      { name: 'Prettier', description: 'Code formatting' },
      { name: 'Lefthook', description: 'Git hooks (pre-commit & pre-push)' },
      { name: 'CODEOWNERS', description: 'PR review enforcement' },
    ],
  },
];
