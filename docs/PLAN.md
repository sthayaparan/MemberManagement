# Member Management MVP - Complete Implementation Plan

## Overview

Build a complete Member Management web app with C# ASP.NET Core backend (REST API + SQLite) and Next.js frontend (React UI + AI chat sidebar) in parallel. Frontend and backend teams define API contracts upfront, then work independently. Add comprehensive tests after feature implementation.

---

## Key Decisions Locked In

1. **Database Seeding**: ✓ YES — Pre-populate SQLite with 3-5 example members (John Smith, Jane Doe, Robert Johnson, Emily Brown, Michael Wilson) on first startup
2. **AI Prompt Engineering**: ✓ YES — Include JSON format examples in system prompt for reliable member operation parsing
3. **Error Messaging**: ✓ BOTH — User-friendly messages in UI + detailed technical logs server-side

---

# FRONTEND - Member Management MVP

## Overview
Next.js React frontend for the Member Management application. Provides UI for member CRUD operations and integrates with an AI chat sidebar for natural language member management.

## Technical Stack

- **Framework**: Next.js 15+ with TypeScript 5.6+
- **Styling**: Tailwind CSS 4+ with custom color scheme configuration
- **HTTP Client**: fetch API (built-in) or axios
- **Testing**: Vitest 2+ (unit/integration), React Testing Library 16+ (with @testing-library/jest-dom 6.4+), Playwright 1.50+ (E2E)
- **State Management**: React hooks (useState, useContext) — keep simple, no Redux
- **Component Library**: shadcn/ui or headless components for simplicity

## Design Decisions - Frontend

1. **API Communication**: All backend communication through typed service layer (`services/memberService.ts`, `services/aiService.ts`)
   - Environment variable: `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:5000/api`)
   - OPENROUTER_API_KEY in `.env.local`

2. **Error Handling**: 
   - Frontend: Display user-friendly error messages in toasts/modals
   - Examples: "Unable to add member. Please check your input." instead of technical errors
   - Store full error details in logs for debugging

3. **Styling Approach**:
   - Tailwind CSS with project color scheme as CSS variables in `tailwind.config.ts`
   - Purple buttons (#753991), Blue links (#209dd7), Yellow accents (#ecad0a), Dark Navy headings (#032147), Gray text (#888888)
   - Mobile-responsive design required for all pages

4. **AI Chat Integration**:
   - Sidebar component always visible/collapsible
   - System prompt includes JSON format examples for reliable parsing
   - AI operations trigger backend API calls (create/edit/delete member)
   - Message history persisted in component state (not localStorage for MVP)

5. **Folder Structure**:
   ```
   frontend/
   ├── app/
   │   ├── layout.tsx                 (Root layout with navigation)
   │   ├── page.tsx                   (Landing page)
   │   ├── members/
   │   │   ├── page.tsx               (Member list)
   │   │   ├── new/page.tsx           (Add member)
   │   │   ├── [id]/page.tsx          (Edit member)
   │   │   └── [id]/view/page.tsx     (View member details)
   ├── components/
   │   ├── Layout.tsx                 (Header, navigation, footer)
   │   ├── MemberList.tsx             (Display members in table/grid)
   │   ├── MemberForm.tsx             (Reusable form for add/edit)
   │   ├── MemberDetail.tsx           (View single member)
   │   ├── DeleteConfirmModal.tsx     (Delete confirmation)
   │   ├── ChatSidebar.tsx            (AI chat interface)
   │   └── Button.tsx, Input.tsx, etc. (Shared UI components)
   ├── services/
   │   ├── memberService.ts           (Member API calls: GET, POST, PUT, DELETE)
   │   └── aiService.ts               (OpenRouter API integration)
   ├── hooks/
   │   └── useMember.ts               (Custom hooks for member operations)
   ├── types/
   │   └── Member.ts                  (TypeScript interfaces)
   ├── __tests__/
   │   ├── memberService.test.ts
   │   ├── components/
   │   └── e2e/
   ├── .env.local                     (Local environment variables)
   ├── tailwind.config.ts             (Color scheme configuration)
   ├── next.config.js
   ├── package.json
   ├── tsconfig.json
   └── AGENTS.md                      (Technical decisions)
   ```

## Implementation Plan - Frontend

### Phase 1: Project Setup
- Initialize Next.js project with TypeScript
- Configure Tailwind CSS with project color scheme variables
- Create folder structure and environment setup
- Setup .env.local with API_BASE_URL and OPENROUTER_API_KEY

### Phase 2: Core UI Components (Depends on Phase 1)
- Create shared components: Button, Input, Modal, Card
- Create Layout component with Header, Navigation, Footer
- Setup responsive grid/flexbox layout
- Apply color scheme throughout

### Phase 3: Member Management Components (Depends on Phase 2)
- **MemberList.tsx**: Display all members in table/grid
  - Columns: First Name, Surname, DOB, Postal Code, Mobile Number
  - Actions: Edit button, Delete button with confirmation
  - Empty state: "No members. Add one to get started."
  
- **MemberForm.tsx**: Reusable form for add/edit
  - Fields: firstName (required), surname (required), dob (required, date picker), postalCode (required), mobileNumber (required)
  - Validation: Client-side for UX, server-side for security
  - Submit button color: Purple (#753991)
  
- **MemberDetail.tsx**: View member details in read-only format
- **DeleteConfirmModal.tsx**: Confirmation before deletion with warning

### Phase 4: Pages & Routing (Depends on Phase 3)
- `/app/page.tsx` — Landing page with navigation to member management
- `/app/members/page.tsx` — List all members (use MemberList component)
- `/app/members/new/page.tsx` — Add new member form (use MemberForm)
- `/app/members/[id]/page.tsx` — Edit member form with pre-filled data
- `/app/members/[id]/view/page.tsx` — View member details

### Phase 5: API Service Layer (Depends on Phase 4, Phase 2 API contract)
- Create `services/memberService.ts`:
  - `getMembersAll()` — GET /api/members
  - `getMember(id)` — GET /api/members/{id}
  - `createMember(member)` — POST /api/members
  - `updateMember(id, member)` — PUT /api/members/{id}
  - `deleteMember(id)` — DELETE /api/members/{id}
- Create `types/Member.ts` interface matching backend MemberDto
- Handle HTTP errors and map to user-friendly messages
- Setup loading/error states

### Phase 6: AI Chat Sidebar (Depends on Phase 5, Phase 2 API contract)
- **ChatSidebar.tsx**:
  - Collapsible sidebar (toggle button in header)
  - Message history display (user message on right, AI on left)
  - Input form with send button
  - Styling: Use project color scheme

- **aiService.ts**:
  - Send message to OpenRouter with openai/gpt-oss-120b model
  - System prompt includes JSON format examples:
    ```json
    {
      "action": "create|edit|delete",
      "member": {
        "firstName": "string",
        "surname": "string",
        "dob": "YYYY-MM-DD",
        "postalCode": "string",
        "mobileNumber": "string"
      }
    }
    ```
  - Parse AI response to extract action and member data
  - Trigger appropriate API call (createMember, updateMember, deleteMember)
  - Display operation result in chat

### Phase 7: Testing (Depends on Phases 5-6)
- **Unit Tests** (`__tests__/`):
  - memberService.test.ts: Test all API calls, error handling
  - components/MemberForm.test.tsx: Form validation, submission
  - components/MemberList.test.tsx: Rendering, interactions
  - Use Jest + React Testing Library
  
- **E2E Tests** (`__tests__/e2e/`):
  - Member list loads and displays members
  - Add member workflow: Navigate → Fill form → Submit → Verify creation
  - Edit member workflow: Load → Modify → Save → Verify update
  - Delete member workflow: Confirm → Delete → Verify removal
  - AI chat workflow: Send prompt → Verify operation executed
  - Use Cypress or Playwright

### Phase 8: Polish & Documentation
- Ensure responsive design (mobile-first)
- Test cross-browser (Chrome, Firefox, Safari)
- Create/update README with setup instructions
- Verify all error messages are user-friendly
- Document component props and usage

## Frontend Dependencies (Locked In)

- next.js: ^15.0.0
- react: ^19.0.0
- typescript: ^5.6.0
- tailwindcss: ^4.0.0
- vitest: ^2.0.0
- @testing-library/react: ^16.0.0
- @testing-library/jest-dom: ^6.4.0
- playwright: ^1.50.0

---

# BACKEND - Member Management MVP

## Overview
C# ASP.NET Core REST API backend for the Member Management application. Provides CRUD endpoints for member operations, SQLite persistence, and integrates with OpenRouter for AI-driven member management.

## Technical Stack

- **Framework**: ASP.NET Core 8.0+ (latest LTS)
- **ORM**: Entity Framework Core 8.0+ with SQLite provider
- **Testing**: xUnit + Moq
- **Database**: SQLite (file-based, auto-initialization)
- **Logging**: Built-in ILogger (console + file)
- **Error Handling**: Custom middleware for consistent error responses

## Design Decisions - Backend

1. **Database**:
   - SQLite database: `MemberManagement.db` in project root
   - Auto-initialization on startup: Creates database and tables if missing
   - Seed data: Populates 3-5 example members on first run
   - No authentication/authorization for MVP

2. **API Design**:
   - RESTful endpoints: GET, POST, PUT, DELETE
   - Base URL: `http://localhost:5000/api`
   - Request/Response format: JSON
   - Consistent error responses with HTTP status codes and error messages

3. **Error Handling**:
   - Custom middleware catches all exceptions
   - Logs full technical details: timestamp, request context, stack traces, error codes
   - Returns user-friendly error messages in JSON response:
     ```json
     { "error": "Unable to add member. Please check your input.", "code": "VALIDATION_ERROR" }
     ```
   - HTTP Status Codes: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)

4. **Validation**:
   - Client-side: Frontend validates user input
   - Server-side: Backend validates all requests (defense in depth)
   - Entity-level validation: Data annotations (Required, StringLength, etc.)
   - Business logic validation: MemberService layer checks for duplicates, format validity

5. **Logging**:
   - Log all operations: Create, Read, Update, Delete
   - Log errors with full context and stack traces
   - Log API requests/responses (method, endpoint, status code, duration)
   - No sensitive data (passwords, keys) logged

6. **Folder Structure**:
   ```
   backend/
   ├── Models/
   │   └── Member.cs                  (Entity with validation)
   ├── Data/
   │   ├── MemberDbContext.cs         (EF Core DbContext)
   │   ├── Migrations/                (EF Core migrations)
   │   └── SeedData.cs                (Database seeding logic)
   ├── Controllers/
   │   └── MembersController.cs       (REST API endpoints)
   ├── Services/
   │   ├── IMemberService.cs          (Interface)
   │   └── MemberService.cs           (Business logic)
   ├── Middleware/
   │   └── ErrorHandlingMiddleware.cs (Global error handler)
   ├── Dto/
   │   └── MemberDto.cs               (Data transfer object)
   ├── Tests/
   │   ├── MemberServiceTests.cs      (Unit tests)
   │   └── MembersControllerTests.cs  (Controller tests)
   ├── appsettings.json               (Configuration)
   ├── appsettings.Development.json
   ├── Program.cs                     (Startup configuration)
   ├── MemberManagement.csproj
   └── AGENTS.md                      (Technical decisions)
   ```

## API Contract

### Base URL
`http://localhost:5000/api`

### Endpoints

#### 1. Get All Members
```
GET /api/members
Response: 200 OK
[
  {
    "id": 1,
    "firstName": "John",
    "surname": "Smith",
    "dob": "1985-05-15",
    "postalCode": "12345",
    "mobileNumber": "555-0101"
  },
  ...
]
```

#### 2. Get Single Member
```
GET /api/members/{id}
Response: 200 OK
{
  "id": 1,
  "firstName": "John",
  "surname": "Smith",
  "dob": "1985-05-15",
  "postalCode": "12345",
  "mobileNumber": "555-0101"
}
Error: 404 Not Found
{ "error": "Member not found", "code": "MEMBER_NOT_FOUND" }
```

#### 3. Create Member
```
POST /api/members
Request:
{
  "firstName": "John",
  "surname": "Smith",
  "dob": "1985-05-15",
  "postalCode": "12345",
  "mobileNumber": "555-0101"
}
Response: 201 Created
{
  "id": 1,
  "firstName": "John",
  ...
}
Error: 400 Bad Request
{ "error": "Validation failed. First name is required.", "code": "VALIDATION_ERROR" }
```

#### 4. Update Member
```
PUT /api/members/{id}
Request:
{
  "firstName": "John",
  "surname": "Doe",
  "dob": "1985-05-15",
  "postalCode": "12345",
  "mobileNumber": "555-0102"
}
Response: 200 OK
{
  "id": 1,
  "firstName": "John",
  "surname": "Doe",
  ...
}
Error: 404 Not Found / 400 Bad Request
```

#### 5. Delete Member
```
DELETE /api/members/{id}
Response: 204 No Content
Error: 404 Not Found
{ "error": "Member not found", "code": "MEMBER_NOT_FOUND" }
```

## Implementation Plan - Backend

### Phase 1: Project Setup
- Create .csproj file with latest .NET 8.0+ SDK
- Add NuGet packages:
  - Microsoft.EntityFrameworkCore.Sqlite
  - Microsoft.EntityFrameworkCore.Design
  - Serilog (logging)
- Create folder structure: Models, Data, Controllers, Services, Middleware, Tests
- Create appsettings.json with database connection string

### Phase 2: API Contract Definition (Alignment with Frontend)
- Document all endpoints as shown above
- Frontend and Backend teams agree on request/response format
- Define error response format
- Lock API contract before proceeding

### Phase 3: Data Layer (Depends on Phase 2)
- **Member.cs** Entity Model:
  - Properties: Id, FirstName, Surname, DOB (DateTime), PostalCode, MobileNumber
  - Add validation attributes (Required, StringLength, etc.)
  - Add property constraints (max lengths, date ranges)

- **MemberDbContext.cs**: Entity Framework Core DbContext
  - Configure Member table mapping
  - Setup relationships (if any)
  - Implement OnModelCreating for constraints

- **Migrations**: Create initial migration
  - `dotnet ef migrations add InitialCreate`
  - `dotnet ef database update` to apply

- **SeedData.cs**: Database seeding
  - Create 3-5 example members (John Smith, Jane Doe, Robert Johnson, Emily Brown, Michael Wilson)
  - Insert on first startup if database is empty
  - Called from Program.cs in app initialization

### Phase 4: Service Layer (Depends on Phase 3)
- **IMemberService.cs** Interface with methods:
  - `GetAllMembersAsync()`
  - `GetMemberByIdAsync(int id)`
  - `CreateMemberAsync(Member member)`
  - `UpdateMemberAsync(int id, Member member)`
  - `DeleteMemberAsync(int id)`

- **MemberService.cs** Implementation:
  - All CRUD operations
  - Validation logic (check required fields, format)
  - Error handling with descriptive messages
  - Logging for all operations
  - Dependency injection: Inject MemberDbContext and ILogger

### Phase 5: API Controller (Depends on Phase 4)
- **MembersController.cs** (API endpoints):
  - GET /api/members — GetAllMembers()
  - POST /api/members — CreateMember()
  - GET /api/members/{id} — GetMemberById()
  - PUT /api/members/{id} — UpdateMember()
  - DELETE /api/members/{id} — DeleteMember()
  - Map HTTP requests to service layer
  - Handle exceptions and return appropriate HTTP status codes
  - Return JSON responses

### Phase 6: Error Handling & Middleware (Depends on Phase 5)
- **ErrorHandlingMiddleware.cs**:
  - Catch all exceptions at global level
  - Log full error details (timestamp, request, stack trace)
  - Return standardized error response (user-friendly message + error code)
  - Handle specific exceptions: ValidationException, NotFoundException, etc.

- **Program.cs** Configuration:
  - Register error handling middleware
  - Setup Entity Framework Core with SQLite
  - Dependency injection: MemberDbContext, IMemberService
  - CORS configuration for frontend
  - Seed database on startup
  - Setup logging (Serilog or built-in ILogger)

### Phase 7: Testing (Depends on Phases 4-6)
- **MemberServiceTests.cs** (xUnit + Moq):
  - Test GetAllMembers()
  - Test CreateMember() with valid/invalid data
  - Test UpdateMember() scenarios
  - Test DeleteMember()
  - Test validation logic
  - Mock MemberDbContext and ILogger
  - >80% code coverage

- **MembersControllerTests.cs**:
  - Test each HTTP endpoint
  - Mock MemberService
  - Test response status codes (200, 201, 400, 404, 500)
  - Test error scenarios
  - Verify logging called

### Phase 8: Integration & Polish
- Test all endpoints with Postman/Insomnia
- Verify SQLite database created with seed data
- Test error scenarios (invalid input, missing fields, not found)
- Performance test (response times with 10+ members)
- Document API in Swagger/OpenAPI (optional for MVP)
- Create start/stop scripts

## Backend Dependencies (Locked In)

- Microsoft.AspNetCore.App: ^8.0.0
- Microsoft.EntityFrameworkCore: ^8.0.0
- Microsoft.EntityFrameworkCore.Sqlite: ^8.0.0
- xUnit: ^2.6.0
- Moq: ^4.20.0
- Serilog: ^3.0.0 (optional, for enhanced logging)

---

# Shared Implementation Timeline

## Development Timeline

| Phase | Backend | Frontend | Parallel | Est. Duration |
|-------|---------|----------|----------|----------------|
| **1** | Project setup | Project setup | Yes | ~1 day |
| **2** | API contract | API contract | Yes (alignment) | ~0.5 day |
| **3** | Data layer + Service | — | — | ~1-2 days |
| **4** | — | UI components + Pages | — | ~2-3 days |
| **5** | MembersController | API service layer | Yes (uses contract) | ~1-2 days |
| **6** | Error middleware | ChatSidebar + AI integration | Yes | ~1-2 days |
| **7** | Testing suite | Testing suite | Yes | ~2-3 days |
| **8** | Integration testing | Integration testing | Yes | ~1-2 days |

**Total MVP Timeline**: ~10-16 days (with parallel development)

---

# Verification Checklist

### After Phase 1 (Setup)
- [ ] Both projects initialize without errors
- [ ] Run `dotnet --version` and `npm --version` to verify tooling
- [ ] .env files are properly configured
- [ ] Start/stop scripts are executable

### After Phase 2 (API Contract)
- [ ] API contract reviewed by both teams
- [ ] No ambiguity in request/response formats
- [ ] Error scenarios clearly defined

### After Phase 3 (Backend API)
- [ ] `dotnet test` — all unit tests pass
- [ ] Backend service starts without errors
- [ ] Each endpoint testable via Postman: GET all, POST create, GET by id, PUT update, DELETE
- [ ] SQLite database is created and persists data after operations
- [ ] Validation works (e.g., POST with invalid data should reject)

### After Phase 4 (Frontend UI)
- [ ] `npm run dev` — frontend starts without errors
- [ ] Navigate to /members — page loads with empty member list
- [ ] Click "Add Member" → form appears with all fields
- [ ] Fill form and submit → success message (even if API not connected)
- [ ] All pages accessible via navigation

### After Phase 5 (AI Chat)
- [ ] AI chat sidebar appears on page
- [ ] Send message to AI chat → message appears in history
- [ ] Send member creation prompt (e.g., "Create member John Smith") → AI responds
- [ ] Verify API call is triggered for member operations

### After Phase 6 (Testing)
- [ ] Backend: `dotnet test` — 100% pass rate, >80% code coverage
- [ ] Frontend: `npm run test` — 100% pass rate
- [ ] Frontend E2E: `npm run test:e2e` — all scenarios pass

### After Phase 7-8 (Integration)
- [ ] Complete end-to-end flow: Create member in UI → list → AI chat → edit member → verify changes
- [ ] All error scenarios handled gracefully
- [ ] Performance acceptable with 10+ members
- [ ] Responsive design works on mobile (test with DevTools)
- [ ] README has clear setup instructions
- [ ] Start/stop scripts work on Windows and Linux

---

# Coding Standards (Shared)

1. Use latest versions of libraries and idiomatic approaches as of 2026
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
4. When hitting issues, always identify root cause before trying a fix. Prove with evidence, then fix the root cause.

---

# Sample Seed Data

```
Member 1: John Smith (DOB: 1985-05-15, Postal: 12345, Mobile: 555-0101)
Member 2: Jane Doe (DOB: 1990-03-22, Postal: 54321, Mobile: 555-0102)
Member 3: Robert Johnson (DOB: 1988-07-10, Postal: 67890, Mobile: 555-0103)
Member 4: Emily Brown (DOB: 1992-11-08, Postal: 11111, Mobile: 555-0104)
Member 5: Michael Wilson (DOB: 1986-02-28, Postal: 22222, Mobile: 555-0105)
```

---

# AI Chat System Prompt Template

```
You are a helpful assistant managing member records. When the user requests to create, edit, or delete a member, respond with a JSON object in this format:

{
  "action": "create|edit|delete",
  "member": {
    "id": "number (only for edit/delete)",
    "firstName": "string",
    "surname": "string",
    "dob": "YYYY-MM-DD",
    "postalCode": "string",
    "mobileNumber": "string"
  }
}

Then provide a friendly confirmation message.

Example:
User: "Create a member named John Smith born on May 15, 1985 with postal code 12345 and mobile 555-0101"
Assistant: 
{
  "action": "create",
  "member": {
    "firstName": "John",
    "surname": "Smith",
    "dob": "1985-05-15",
    "postalCode": "12345",
    "mobileNumber": "555-0101"
  }
}
I've created a new member record for John Smith.
```

---

# Color Scheme Reference

- **Accent Yellow**: `#ecad0a` - accent lines, highlights, important visual elements
- **Blue Primary**: `#209dd7` - links, key sections, primary actions (limited use)
- **Purple Secondary**: `#753991` - submit buttons, important actions, secondary emphasis
- **Dark Navy**: `#032147` - main headings, text emphasis
- **Gray Text**: `#888888` - supporting text, labels, disabled states

---

# Next Steps for Implementation

1. **Backend team**: Start Phase 1 (project initialization)
2. **Frontend team**: Start Phase 1 (project initialization) in parallel
3. **Both teams**: Finalize API contract in Phase 2 before proceeding to Phase 3+
4. **Proceed sequentially**: Phases 3-8 follow dependencies outlined in timeline

Ready for implementation approval?
