# Member Management MVP - As-Built

Status of the Member Management app as actually implemented. This replaces the
original speculative build plan; where the code and the `AGENTS.md` files differ
from earlier drafts of this document, the code wins.

---

## Overview

Web app for managing member records with an AI chat assistant that can create,
edit, and delete members from natural language.

- **Frontend** (`/frontend`): Next.js 15 App Router, React 19, TypeScript 5.6, Tailwind CSS 4
- **Backend** (`/backend`): ASP.NET Core 10 minimal API, C# 13, EF Core 10 + SQLite
- **AI**: OpenRouter, model `openai/gpt-oss-120b`, called server-side only
- **Tests**: xUnit integration tests (backend), Vitest + Playwright (frontend)

Member fields: `firstName`, `surname`, `dateOfBirth`, `postalCode`, `mobileNumber`
(plus server-managed `id`, `createdAt`, `updatedAt`).

---

## Architecture

### Request flow - the browser never calls the backend or OpenRouter directly

```
Browser (memberService.ts / aiService.ts)
  -> same-origin Next.js API routes (app/api/*)
       -> ASP.NET Core backend  (members)
       -> OpenRouter            (chat, API key attached here)
```

The proxy layer exists to avoid CORS and to keep `OPENROUTER_API_KEY` out of the
client bundle. Adding a member operation means touching all three layers:
client service -> proxy route -> backend endpoint.

- `frontend/src/app/api/members/route.ts` - GET (list), POST (create)
- `frontend/src/app/api/members/[id]/route.ts` - GET, PUT, DELETE
- `frontend/src/app/api/chat/route.ts` - POST, forwards to OpenRouter
- `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5156/api`) is read
  **server-side** by the proxy routes despite the `NEXT_PUBLIC_` prefix.

### Secrets

`OPENROUTER_API_KEY` lives in the **repo-root `.env`** (the only key there). That
file is outside the Next.js project root, so `frontend/next.config.js` loads it
explicitly with `process.loadEnvFile('../.env')` at startup. It is read only in
`app/api/chat/route.ts`. `.env` is git-ignored.

### Frontend state

React hooks only - no Redux, no Context. Cross-component refresh uses a single
`window` event: after the AI chat applies an action it dispatches
`members:changed`, and the home page (`app/page.tsx`) re-fetches the list on that
event.

### Backend

Single-file minimal API in `backend/Program.cs`:

- Endpoint handlers are local functions; `ValidateMember` is shared by create and update.
- Namespace is `MemberManagementApi.*` even though the project/folder is `backend`.
- `ApplicationDbContext` overrides `SaveChanges`/`SaveChangesAsync` to stamp
  `CreatedAt`/`UpdatedAt` automatically - handlers never set them.
- Schema is created with `Database.EnsureCreated()` on startup. **No EF
  migrations.** Schema changes require deleting `members.db` in dev.
- `SeedDatabase` inserts 5 members when the table is empty.
- `public partial class Program;` at the bottom exists only so the test project
  can reference `Program` via `WebApplicationFactory`.
- Bind target for create/update is the `MemberRequestDto` record, not the entity.
- CORS policy `AllowFrontend` permits `localhost:3000` / `127.0.0.1:3000`
  (unused in practice since the browser only talks to the Next proxy).
- HTTPS redirection is disabled for local dev.

---

## API contract

Base: `http://localhost:5156/api/members`

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/members` | 200 `{ "data": [Member] }` | - |
| GET | `/api/members/{id}` | 200 `{ "data": Member }` | 404 |
| POST | `/api/members` | 201 `{ "data": Member }` + Location | 400 |
| PUT | `/api/members/{id}` | 200 `{ "data": Member }` | 404, 400 |
| DELETE | `/api/members/{id}` | 204 | 404 |
| GET | `/health` | 200 `{ "status": "healthy" }` | - |

Success bodies are wrapped in `{ "data": ... }`. Errors are
`{ "error": "<message>", "code": "<CODE>" }` with codes `MEMBER_NOT_FOUND` and
`VALIDATION_ERROR`.

Request body for create/update:

```json
{ "firstName": "", "surname": "", "dateOfBirth": "YYYY-MM-DD", "postalCode": "", "mobileNumber": "" }
```

### Validation (server-side, source of truth)

- All five fields required and non-whitespace; strings are trimmed before saving.
- `dateOfBirth` must be a real date, not the default, and not in the future.
- Frontend `MemberForm` does required-field checks for UX only; the backend
  re-validates everything.

---

## AI chat

`frontend/src/components/ChatSidebar.tsx` - rendered once in the root layout with
a floating toggle button. On send:

1. Fetches the current member list for context.
2. POSTs `{ messages, members }` to `/api/chat`.
3. `/api/chat` prepends a system prompt (built in `buildSystemPrompt`) and calls
   OpenRouter. If the model returns valid JSON it is passed through as-is;
   otherwise the route returns `{ action: null, message: <raw text> }`.
4. `applyAiAction` runs the returned `create | edit | delete` via `memberService`,
   then dispatches `members:changed`.

Chat history is component state only - not persisted.

### Action contract the model must produce

```json
{
  "action": "create | edit | delete",
  "member": {
    "id": "number (required for edit/delete, omit for create)",
    "firstName": "string",
    "surname": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "postalCode": "string",
    "mobileNumber": "string"
  },
  "message": "friendly confirmation message"
}
```

For non-operations the model returns `{ "action": null, "message": "..." }`. For
edits, `applyAiAction` fetches the existing member and fills any field the model
omitted.

Note: the client type and `applyAiAction` use `"edit"`; the human-readable prompt
template in older docs said `"edit"` as well - keep the client and prompt in sync
if this changes.

---

## Frontend structure

```
frontend/src/
  app/
    layout.tsx              Root layout: Header + <main> + footer + ChatSidebar
    page.tsx                Home: member list, stats cards, delete modal, members:changed listener
    globals.css
    members/
      page.tsx              redirect('/') - list lives on home
      new/page.tsx          Add member (MemberForm -> createMember -> back to /)
      [id]/page.tsx         Edit member (fetch -> MemberForm -> updateMember -> back to /)
    api/
      members/route.ts, members/[id]/route.ts   backend proxy
      chat/route.ts                             OpenRouter proxy
  components/
    Button, Input, Modal, Card, Alert, Header   shared UI
    MemberForm                                  add/edit form, client-side required checks
    MemberList                                  table with edit link + delete button, loading/empty states
    ChatSidebar                                 AI assistant panel
    index.ts                                    barrel export
  services/
    memberService.ts        CRUD against /api/members/*
    aiService.ts            chat against /api/chat
  types/Member.ts           Member, MemberFormData, ApiResponse<T>
  utils/dateFormatter.ts    formatDate() - timezone-safe YYYY-MM-DD -> "Mon D, YYYY"
  __tests__/
    memberService.test.ts, aiService.test.ts
    components/MemberForm.test.tsx, MemberList.test.tsx
    e2e/navigation.spec.ts
```

Colors are Tailwind tokens defined in `frontend/tailwind.config.ts`:
`accent-yellow #ecad0a`, `blue-primary #209dd7`, `purple-secondary #753991`,
`dark-navy #032147`, `gray-text #888888`.

---

## Backend structure

```
backend/
  Program.cs                    all endpoints, validation, seeding, DTO
  Models/Member.cs              entity
  Data/ApplicationDbContext.cs  DbSet, model config, timestamp stamping
  appsettings.json              connection string, log levels
  Properties/launchSettings.json  http profile -> port 5156
backend.Tests/
  MembersEndpointsTests.cs      WebApplicationFactory<Program>, isolated temp SQLite per run
```

`members.db` is created in the working directory on first run and is not
git-ignored (nor is it currently committed).

---

## Commands

No solution file; the two .NET projects build independently.

| Task | Command | From |
|---|---|---|
| Run backend | `dotnet run` (port 5156) | `backend/` |
| Backend tests | `dotnet test` | `backend.Tests/` |
| Single backend test | `dotnet test --filter "FullyQualifiedName~CreateMember"` | `backend.Tests/` |
| Run frontend | `npm run dev` (port 3000) | `frontend/` |
| Frontend unit/component tests | `npm test` | `frontend/` |
| Single frontend test | `npm test -- src/__tests__/memberService.test.ts` | `frontend/` |
| Frontend E2E | `npm run test:e2e` (auto-starts dev server) | `frontend/` |
| Lint | `npm run lint` | `frontend/` |
| Build | `npm run build` / `dotnet build` | resp. dir |

`scripts/start-backend.{sh,bat}` and `stop-backend.{sh,bat}` wrap
`dotnet build` + `dotnet run` / `pkill -f "dotnet run"`.

---

## Test coverage

**Backend** (`MembersEndpointsTests.cs`, 10 tests): list returns seeded members;
get-by-unknown-id 404; create valid -> 201; create with missing field -> 400
(theory); create future DOB -> 400; update existing -> 200; update unknown -> 404;
delete existing -> 204 then 404; delete unknown -> 404. Each test class instance
runs the real app against its own temp SQLite file.

**Frontend**:
- `memberService.test.ts` - getAllMembers success/failure, createMember success
- `aiService.test.ts` - posts to `/api/chat`, throws friendly error on failure
- `MemberForm.test.tsx` - required-field errors, submits valid data, pre-fills on edit
- `MemberList.test.tsx` - loading state, empty state, renders rows, onDelete id
- `e2e/navigation.spec.ts` - two navigation checks

---

## Known gaps and issues

- **`e2e/navigation.spec.ts` is stale.** It clicks `text=View Members` but the
  header link reads "Members", and asserts `toHaveURL('/members')` even though
  `/members` redirects to `/`. Both tests are expected to fail as written.
- **Thin E2E coverage.** No end-to-end specs for the add / edit / delete / AI-chat
  workflows the original plan called for.
- **No `ChatSidebar` component test** and no tests for the Next.js proxy routes.
- **No service/unit layer on the backend**, so there are integration tests only -
  fine for this size, but there is no fast unit tier.
- **Stale docs:** `frontend/README.md` still references `.env.local` and port
  5000; the real config is repo-root `.env` and port 5156.
- **`.gitignore` is minimal** (`.env`, `bin/`, `obj/`) - `node_modules/`,
  `.next/`, `members.db`, and Playwright/Vitest output are not ignored.
- **AI edit relies on the model returning the correct `id`** from the member list
  it was given; there is no fuzzy name matching or disambiguation.

---

## Seed data

| First | Surname | DOB | Postcode | Mobile |
|---|---|---|---|---|
| John | Smith | 1980-05-15 | SW1A 1AA | +44 7700 900001 |
| Jane | Doe | 1985-08-22 | E1 6AN | +44 7700 900002 |
| Robert | Johnson | 1975-03-10 | M1 1AE | +44 7700 900003 |
| Emily | Brown | 1992-11-30 | B33 8TH | +44 7700 900004 |
| Michael | Wilson | 1988-06-18 | LS1 3AA | +44 7700 900005 |

---

## Coding standards (from root `AGENTS.md`)

1. Latest library versions and idiomatic usage.
2. Keep it simple - no over-engineering, no speculative defensive programming, no extra features.
3. Be concise; keep READMEs minimal. No emojis, ever.
4. Diagnose root cause with evidence before fixing - do not guess.
