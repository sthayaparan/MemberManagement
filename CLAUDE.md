# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Member Management MVP: CRUD over member records (firstName, surname, dateOfBirth, postalCode, mobileNumber) plus an AI chat sidebar that can create/edit/delete members via natural language. Next.js frontend in `/frontend`, ASP.NET Core minimal-API backend in `/backend`, SQLite persistence, OpenRouter (`openai/gpt-oss-120b`) for the AI.

`AGENTS.md` files are the source of truth for design decisions: root `AGENTS.md` (business requirements, color scheme, coding standards), `backend/AGENTS.md`, `frontend/AGENTS.md`. Keep those updated when design decisions change. `docs/PLAN.md` is an as-built overview of the whole system (architecture, API contract, AI action contract, test coverage, known gaps) — a good orientation doc; update it when architecture changes.

## Commands

There is no solution file; the two .NET projects build independently.

Backend (from `backend/`):
- `dotnet run` — starts API on `http://localhost:5156` (port from `Properties/launchSettings.json`). Creates and seeds `members.db` on first run.
- `dotnet build`

Backend tests (from `backend.Tests/`):
- `dotnet test` — xUnit integration tests via `WebApplicationFactory<Program>`, each run against an isolated temp SQLite file
- `dotnet test --filter "FullyQualifiedName~CreateMember"` — run a single test / subset

Frontend (from `frontend/`):
- `npm run dev` — `http://localhost:3000`
- `npm run build`
- `npm test` — Vitest (unit/component); `npm test -- src/__tests__/memberService.test.ts` for one file
- `npm run test:e2e` — Playwright (config auto-starts `npm run dev`); E2E specs live in `src/__tests__/e2e/` and are excluded from the Vitest run
- `npm run lint`

Convenience scripts in `scripts/` (`start-backend.{sh,bat}`, `stop-backend.{sh,bat}`) just wrap `dotnet build && dotnet run`.

## Architecture

### Request flow — the browser never calls the backend or OpenRouter directly

`services/memberService.ts` and `services/aiService.ts` call **same-origin Next.js API routes**, which proxy server-side:
- `app/api/members/route.ts` + `app/api/members/[id]/route.ts` → backend REST API
- `app/api/chat/route.ts` → OpenRouter (holds the API key)

This is deliberate: it avoids CORS and keeps `OPENROUTER_API_KEY` out of the client bundle. When adding a member operation, wire it through all three layers (service → proxy route → backend).

`NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5156/api`) is read **server-side by the proxy routes**, despite the `NEXT_PUBLIC_` prefix. The backend base URL is not otherwise exposed to the browser.

### Secrets

`OPENROUTER_API_KEY` lives in the **repo-root `.env`**, which is outside the Next.js project root. `frontend/next.config.js` loads it explicitly via `process.loadEnvFile('../.env')` at startup. It is only ever read in `app/api/chat/route.ts`.

### AI chat

`components/ChatSidebar.tsx` is rendered once in the root layout (`app/layout.tsx`) with a floating toggle. On send it fetches the current member list, posts `{ messages, members }` to `/api/chat`, and `applyAiAction` runs the returned `create|edit|delete` via `memberService`, then dispatches a **`members:changed`** window event. The home page (`app/page.tsx`) listens for that event to refetch — this is the only cross-component sync mechanism (no Redux/Context). Chat history is component state only, not persisted.

The system prompt (defining the JSON action contract) is built in `app/api/chat/route.ts:buildSystemPrompt`. If the model returns non-JSON, the route falls back to `{ action: null, message: content }`.

### Backend

Single-file minimal API in `backend/Program.cs`: endpoint handlers are local functions, `ValidateMember` is shared by create and update, `SeedDatabase` inserts 5 members when the table is empty. Responses are wrapped as `{ "data": ... }`; errors as `{ "error": "...", "code": "MEMBER_NOT_FOUND" | "VALIDATION_ERROR" }`.

- Namespace is `MemberManagementApi.*` even though the project and folder are named `backend`.
- No EF migrations — `Database.EnsureCreated()` at startup. Schema changes mean deleting `members.db` (dev) or adding migrations.
- `ApplicationDbContext` overrides `SaveChanges`/`SaveChangesAsync` to stamp `CreatedAt`/`UpdatedAt` automatically; handlers must not set them.
- `public partial class Program;` at the bottom exists solely so the test project can reference `Program`.
- Model binds a `MemberRequestDto` record (not the `Member` entity) for create/update.

## Coding standards (from root AGENTS.md)

- Latest library versions and idiomatic usage. Backend targets **.NET 10 / C# 13**; frontend is **Next.js 15 / React 19 / Tailwind 4**.
- Keep it simple. No over-engineering, no speculative defensive programming, no extra features.
- Be concise; keep READMEs minimal. **No emojis, ever.**
- Diagnose root cause with evidence before attempting a fix — do not guess.
- Colors are Tailwind tokens (`accent-yellow`, `blue-primary`, `purple-secondary`, `dark-navy`, `gray-text`) defined in `frontend/tailwind.config.ts`; submit buttons use `purple-secondary`.
- Do not add debug-only routes or pages to the app directory.
