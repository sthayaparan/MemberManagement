# Member Management Frontend

Next.js 15 React frontend with TypeScript, Tailwind CSS, and comprehensive testing using Vitest and Playwright.

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4+
- **Unit Testing**: Vitest 2+ with React Testing Library 16+
- **E2E Testing**: Playwright 1.50+
- **HTTP Client**: Fetch API + Axios

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   └── members/            # Member pages
│   ├── components/             # Reusable React components
│   ├── services/               # API services
│   │   ├── memberService.ts    # Member CRUD operations
│   │   └── aiService.ts        # AI chat integration
│   ├── hooks/                  # Custom React hooks
│   │   └── useMember.ts        # Member management hook
│   ├── types/                  # TypeScript interfaces
│   │   └── Member.ts           # Member type definitions
│   └── __tests__/              # Test files
│       ├── memberService.test.ts
│       └── e2e/                # End-to-end tests
├── public/                     # Static assets
├── .env.local                  # Local environment variables
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Environment Variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
OPENROUTER_API_KEY=your_api_key_here
```

## Installation

```bash
cd frontend
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Testing

### Unit and Integration Tests

Run tests with Vitest:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

### End-to-End Tests

Run Playwright tests:

```bash
npm run test:e2e
```

Run Playwright with UI:

```bash
npm run test:e2e:ui
```

## Building

Build for production:

```bash
npm run build
npm run start
```

## Code Quality

Lint the code:

```bash
npm run lint
```

## Color Scheme

- **Accent Yellow**: `#ecad0a`
- **Blue Primary**: `#209dd7`
- **Purple Secondary**: `#753991`
- **Dark Navy**: `#032147`
- **Gray Text**: `#888888`

## API Integration

Member CRUD operations are handled by `memberService.ts`. All API calls go to `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:5000/api`).

### Available Endpoints

- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get single member
- `POST /api/members` - Create member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

## AI Chat

The AI chat sidebar integrates with OpenRouter using the `openai/gpt-oss-120b` model. Configure `OPENROUTER_API_KEY` in `.env.local`.

## Notes

- Keep components simple and focused on single responsibility
- Use React hooks for state management
- Test critical user flows with E2E tests
- Unit tests focus on services and utility functions
