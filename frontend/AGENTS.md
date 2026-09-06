# Frontend - Member Management UI

## Technical Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS 4, custom color scheme in `tailwind.config.ts`
- **State**: React hooks only (`useState`/`useEffect`) - no Redux/Context
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page: member list, add/delete
│   │   ├── members/[id]/page.tsx    # Edit member
│   │   ├── members/new/page.tsx     # Add member
│   │   ├── members/page.tsx         # Redirects to home (list lives there)
│   │   └── api/
│   │       ├── members/[route.ts, [id]/route.ts]  # Proxy to backend
│   │       └── chat/route.ts        # Server-side OpenRouter proxy (holds API key)
│   ├── components/                  # Button, Input, Modal, Card, Alert, Header,
│   │                                 # MemberForm, MemberList, ChatSidebar
│   ├── services/
│   │   ├── memberService.ts         # Calls /api/members/* (client-safe)
│   │   └── aiService.ts             # Calls /api/chat (client-safe)
│   ├── lib/backend.ts               # Backend URL + proxyToBackend() helper (server-only)
│   ├── utils/dateFormatter.ts
│   └── types/Member.ts
```

## Design Decisions

1. **API communication**: The browser never calls the backend or OpenRouter directly.
   `memberService.ts` and `aiService.ts` call same-origin Next.js API routes
   (`app/api/members/*`, `app/api/chat`), which proxy to the real backend /
   OpenRouter server-side. This avoids CORS issues and keeps secrets off the client.
   - `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5156/api`) - backend URL, used server-side by the proxy routes.
   - The members proxy routes share `proxyToBackend()` in `lib/backend.ts`: it
     passes the backend's JSON body and status straight through, maps a 204 to an
     empty response, and turns a connection failure into
     `{ error, code: "BACKEND_UNAVAILABLE" }` (502) so the client always gets JSON.
   - `memberService` expects the `{ data }` / `{ error, code }` envelope exactly -
     no response-shape fallbacks.

2. **AI chat sidebar** (`components/ChatSidebar.tsx`): Collapsible panel, always
   available via a floating toggle button (rendered in the root layout). On send:
   fetches the current member list for context, posts `{ messages, members }` to
   `/api/chat`, then applies the returned `create|edit|delete` action via
   `memberService` and dispatches a `members:changed` window event so the member
   list (home page) refetches. Message history is kept in component state only
   (not persisted), per MVP scope.

3. **Secrets**: `OPENROUTER_API_KEY` lives in the repo-root `.env` (see root
   [AGENTS.md](../AGENTS.md)). Since that's outside this Next.js project root,
   `next.config.js` loads it explicitly via `process.loadEnvFile` at startup. It
   is only ever read in `app/api/chat/route.ts` (server-side) - never exposed to
   the client bundle.

4. **Validation**: Client-side validation in `MemberForm` (required fields, and a
   "not in the future" check on the date of birth) is for UX only; the backend is
   the source of truth and re-validates everything. On success the page navigates
   away, so `MemberForm` only renders errors, never a success state.

5. **AI response parsing**: `app/api/chat/route.ts` pulls the first balanced
   `{ ... }` block out of the model's reply (models often wrap JSON in ```` ``` ````
   fences or add prose), and only the member `id`, `firstName`, and `surname` are
   sent to OpenRouter for context - not DOB, postal code, or mobile number.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm run lint
npm test          # vitest (unit/component)
npm test -- --coverage   # enforces the thresholds in vitest.config.ts
npm run test:e2e  # playwright; stubs /api/* so no backend is needed
```

## Notes

- No Redux/state library - component state + one `window` event for cross-component
  refresh is sufficient at this scale.
- Debug-only routes/pages should not be added to the app directory; use browser
  devtools or the `backend.http` file instead.
