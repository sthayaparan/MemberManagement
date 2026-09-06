# Backend - Member Management API

## Stack

- ASP.NET Core 10, minimal APIs, C# 13, nullable enabled
- EF Core 10 with SQLite (`Microsoft.EntityFrameworkCore.Sqlite`)
- `Microsoft.AspNetCore.OpenApi` for the OpenAPI document (dev only)
- Namespace: `MemberManagementApi.*` (the project/folder is `backend`)

## Layout

```
backend/
  Program.cs                    all endpoints, validation, seeding, DTO, error handler
  Models/Member.cs              entity
  Data/ApplicationDbContext.cs  DbSet + model config + timestamp stamping
  appsettings.json              connection string, log levels
  Properties/launchSettings.json  http profile -> port 5156
  backend.http                  sample requests (VS Code REST Client)
backend.Tests/
  MembersEndpointsTests.cs      WebApplicationFactory<Program>, one temp SQLite DB per test
```

## Design decisions

1. **Single file.** All endpoint handlers are local functions in `Program.cs`.
   There is no controller/service/repository layer - the app is small enough
   that the extra indirection is not worth it.

2. **`ValidateMember` is shared** by create and update. It returns an error
   string or null. Rules: all five fields required and non-whitespace; first
   name / surname <= 100 chars; postal code / mobile <= 20 chars; date of birth
   is a real date, not the default, not in the future.

3. **Schema via `EnsureCreated()`** at startup - no EF migrations. Changing the
   model means deleting `members.db` in dev. If the schema ever needs to evolve
   without data loss, switch to migrations then.

4. **Seeding.** `SeedDatabase` inserts 5 members when the table is empty.

5. **Timestamps.** `ApplicationDbContext.UpdateTimestamps` stamps `CreatedAt`
   (on insert) and `UpdatedAt` (on insert and update) from one clock reading.
   Handlers and the entity never set them.

6. **Errors.** Handled failures return `{ "error": "<message>", "code": "<CODE>" }`
   with `MEMBER_NOT_FOUND` (404) or `VALIDATION_ERROR` (400). A top-level
   middleware turns any unhandled exception into
   `{ "error": "Internal server error", "code": "INTERNAL_ERROR" }` (500) and
   logs it with request context.

7. **No CORS.** The browser never calls this API directly - the Next.js app
   proxies every request server-side. Add a CORS policy only if that changes.

8. **`public partial class Program;`** at the end of `Program.cs` exists solely
   so `WebApplicationFactory<Program>` can boot the app in tests.

9. **DTO.** Create/update bind `MemberRequestDto` (a positional record), not the
   `Member` entity.

## API

Base: `http://localhost:5156/api/members`. All success bodies are wrapped as
`{ "data": ... }`.

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/members` | 200 `{ data: [Member] }` | - |
| GET | `/api/members/{id}` | 200 `{ data: Member }` | 404 |
| POST | `/api/members` | 201 `{ data: Member }` + `Location` | 400 |
| PUT | `/api/members/{id}` | 200 `{ data: Member }` | 404, 400 |
| DELETE | `/api/members/{id}` | 204 | 404 |
| GET | `/health` | 200 `{ status: "healthy" }` | - |

Create/update body:
`{ firstName, surname, dateOfBirth: "YYYY-MM-DD", postalCode, mobileNumber }`.
String fields are trimmed before persistence.

## Member

```csharp
public class Member
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string Surname { get; set; }
    public DateTime DateOfBirth { get; set; }
    public required string PostalCode { get; set; }
    public required string MobileNumber { get; set; }
    public DateTime CreatedAt { get; set; }   // set by ApplicationDbContext
    public DateTime UpdatedAt { get; set; }   // set by ApplicationDbContext
}
```

## Commands

```
dotnet run              # from backend/, serves http://localhost:5156
dotnet build
cd ../backend.Tests && dotnet test
dotnet test --filter "FullyQualifiedName~CreateMember"
```

`members.db` is created in the working directory on first run and is
git-ignored.

## Logging

Request/response lines and validation failures go through `ILogger`, honouring
the levels in `appsettings.json` / `appsettings.Development.json`.
