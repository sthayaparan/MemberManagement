# Backend - Member Management API

## Technical Stack

- **Framework**: ASP.NET Core 10.0 Web API with Minimal APIs
- **Database**: SQLite with Entity Framework Core
- **Language**: C# 13.0
- **API Pattern**: RESTful with JSON responses
- **CORS**: Enabled for localhost:3000 (frontend)

## Project Structure

```
backend/
├── Models/
│   └── Member.cs              # Member entity with properties
├── Data/
│   └── ApplicationDbContext.cs # EF Core database context
├── Program.cs                 # API configuration and endpoints
├── appsettings.json          # Configuration with connection string
└── backend.csproj            # Project file with dependencies
```

## API Endpoints

### Base URL: `http://localhost:5156/api/members`

#### GET /api/members
- **Description**: Fetch all members
- **Response**: `{ "data": [Member[]] }`
- **Status**: 200 OK

#### GET /api/members/{id}
- **Description**: Fetch a single member by ID
- **Response**: `{ "data": Member }`
- **Status**: 200 OK or 404 Not Found

#### POST /api/members
- **Description**: Create a new member
- **Body**: `{ "firstName", "surname", "dateOfBirth", "postalCode", "mobileNumber" }`
- **Response**: `{ "data": Member }` with Location header
- **Status**: 201 Created or 400 Bad Request

#### PUT /api/members/{id}
- **Description**: Update an existing member
- **Body**: `{ "firstName", "surname", "dateOfBirth", "postalCode", "mobileNumber" }`
- **Response**: `{ "data": Member }`
- **Status**: 200 OK or 404 Not Found

#### DELETE /api/members/{id}
- **Description**: Delete a member
- **Response**: Empty body
- **Status**: 204 No Content or 404 Not Found

## Member Model

```csharp
public class Member
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string Surname { get; set; }
    public DateTime DateOfBirth { get; set; }
    public required string PostalCode { get; set; }
    public required string MobileNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

## Development

### Prerequisites
- .NET SDK 10.0+
- Windows, macOS, or Linux

### Build Project
```bash
dotnet build
```

### Run Development Server
```bash
dotnet run
```
Server runs on `http://localhost:5156` (HTTP) and `https://localhost:5157` (HTTPS)

### Run Production Build
```bash
dotnet publish -c Release
```

### Database
- **Type**: SQLite
- **File**: `members.db` (created automatically in project root)
- **Auto-seeding**: Creates 5 example members on first run
- **Migrations**: Applied automatically on startup via `EnsureCreated()`

### Logging
- Development: Detailed logs for debugging
- Production: Information level with warnings

## Dependencies (NuGet Packages)

- `Microsoft.AspNetCore.OpenApi` - OpenAPI/Swagger support
- `Microsoft.EntityFrameworkCore.Sqlite` - SQLite database provider
- `Swashbuckle.AspNetCore` - API documentation

## Error Handling

All errors follow this format:
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Error Codes
- `MEMBER_NOT_FOUND` - Requested member doesn't exist
- `VALIDATION_ERROR` - Request data validation failed

## CORS Configuration

- **Origins**: `http://localhost:3000`, `http://127.0.0.1:3000`
- **Methods**: All
- **Headers**: All

## Testing API

Use the included `backend.http` file with REST Client extension or:

```bash
# Get all members
curl http://localhost:5000/api/members

# Get member by ID
curl http://localhost:5000/api/members/1

# Create member
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","surname":"Doe","dateOfBirth":"1990-01-01","postalCode":"SW1A","mobileNumber":"07700000000"}'

# Update member
curl -X PUT http://localhost:5000/api/members/1 \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","surname":"Doe","dateOfBirth":"1990-01-01","postalCode":"SW1A","mobileNumber":"07700000000"}'

# Delete member
curl -X DELETE http://localhost:5000/api/members/1
```

## Frontend Integration

The frontend is configured to call this API via:
- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` environment variable
- **Default**: `http://localhost:5000`

Ensure both frontend and backend are running:
1. Backend: `dotnet run` (port 5000)
2. Frontend: `npm run dev` (port 3000)

## Notes

- Timestamps (CreatedAt, UpdatedAt) are automatically managed
- All string fields are trimmed before storage
- Validation is enforced on both frontend and backend
- Database is automatically created on first run
- No manual migration files needed (using `EnsureCreated()`)

## Troubleshooting

**Issue**: Port 5000 already in use
```bash
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux
```

**Issue**: Database locked
- Delete `members.db` file and restart

**Issue**: Packages not restoring
```bash
dotnet restore
```
