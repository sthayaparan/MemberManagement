# Member Management - Frontend

Next.js 15 (App Router) + React 19 + Tailwind CSS 4.

```
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm test           # Vitest (unit / component)
npm run test:e2e   # Playwright (stubs the API, no backend needed)
```

The browser only calls same-origin routes under `src/app/api/*`, which proxy to
the backend and to OpenRouter server-side. `OPENROUTER_API_KEY` is read from the
repo-root `.env` (loaded by `next.config.js`), never exposed to the client.

Architecture and design decisions: `AGENTS.md` (this directory) and
`../docs/PLAN.md`.
