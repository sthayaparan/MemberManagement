# Member Management

CRUD web app for member records with an AI chat assistant that can create, edit,
and delete members from natural language.

- `backend/` - ASP.NET Core 10 minimal API, EF Core + SQLite
- `frontend/` - Next.js 15 (App Router), React 19, Tailwind CSS 4
- `docs/PLAN.md` - as-built architecture, API contract, known gaps
- `docs/code_review.md` - review findings and actions

## Prerequisites

- .NET SDK 10
- Node.js 20.12+ (uses `process.loadEnvFile`)
- An OpenRouter API key for the AI chat feature

## Setup

```
cp .env.example .env      # then add your OPENROUTER_API_KEY
cd frontend && npm install
```

## Run

Two processes, from their own directories:

```
cd backend   && dotnet run     # http://localhost:5156
cd frontend  && npm run dev     # http://localhost:3000
```

The backend creates and seeds `backend/members.db` on first run. The browser only
talks to the Next.js app; it proxies to the backend and to OpenRouter server-side
(`frontend/src/app/api/*`), so the OpenRouter key never reaches the client.

`scripts/start-backend.{sh,bat}` and `stop-backend.{sh,bat}` wrap the backend
commands.

## Test

```
cd backend.Tests && dotnet test                 # API integration tests
cd frontend      && npm test                    # unit / component (Vitest)
cd frontend      && npm run test:e2e            # end-to-end (Playwright, stubbed API)
```

## Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `OPENROUTER_API_KEY` | repo-root `.env` | (required) | AI chat; read only in `app/api/chat/route.ts` |
| `NEXT_PUBLIC_API_BASE_URL` | frontend env | `http://localhost:5156/api` | backend URL, used server-side by the proxy routes |
| `ConnectionStrings:DefaultConnection` | `backend/appsettings.json` | `Data Source=members.db` | SQLite file |
