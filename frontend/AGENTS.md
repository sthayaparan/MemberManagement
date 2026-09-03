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
│   │       ├── members/[route.ts,[id]/route.ts]  # Proxy to backend (avoids CORS)
│   │       └── chat/route.ts        # Server-side OpenRouter proxy (holds API key)
│   ├── components/                  # Button, Input, Modal, Card, Alert, Header,
│   │                                 # MemberForm, MemberList, ChatSidebar
│   ├── services/
│   │   ├── memberService.ts         # Calls /api/members/* (client-safe)
│   │   └── aiService.ts             # Calls /api/chat (client-safe)
│   └── types/Member.ts
```

## Design Decisions

1. **API communication**: The browser never calls the backend or OpenRouter directly.
   `memberService.ts` and `aiService.ts` call same-origin Next.js API routes
   (`app/api/members/*`, `app/api/chat`), which proxy to the real backend /
   OpenRouter server-side. This avoids CORS issues and keeps secrets off the client.
   - `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5156/api`) - backend URL, used server-side by the proxy routes.

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

4. **Validation**: Client-side validation in `MemberForm` is for UX only; the
   backend is the source of truth and re-validates everything.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm test         # vitest (unit/component)
npm run test:e2e # playwright
```

## Notes

- No Redux/state library - component state + one `window` event for cross-component
  refresh is sufficient at this scale.
- Debug-only routes/pages should not be added to the app directory; use browser
  devtools or the `backend.http` file instead.
