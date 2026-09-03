using Microsoft.EntityFrameworkCore;
using MemberManagementApi.Data;
using MemberManagementApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();

// Add CORS support for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add Entity Framework Core with SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=members.db";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

// Apply migrations and create database if needed
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
    SeedDatabase(dbContext);
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Add request logging middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] {context.Request.Method} {context.Request.Path} from {context.Request.Headers.Origin}");
    await next();
    Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Response: {context.Response.StatusCode}");
});

// Use CORS
app.UseCors("AllowFrontend");

// Remove HTTPS redirection for local development
// app.UseHttpsRedirection();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck")
    .WithOpenApi();

// Member endpoints
var memberGroup = app.MapGroup("/api/members")
    .WithTags("Members");

// GET all members
memberGroup.MapGet("/", GetAllMembers)
    .WithName("GetAllMembers")
    .WithOpenApi();

// GET member by ID
memberGroup.MapGet("/{id}", GetMemberById)
    .WithName("GetMemberById")
    .WithOpenApi();

// POST create member
memberGroup.MapPost("/", CreateMember)
    .WithName("CreateMember")
    .WithOpenApi();

// PUT update member
memberGroup.MapPut("/{id}", UpdateMember)
    .WithName("UpdateMember")
    .WithOpenApi();

// DELETE member
memberGroup.MapDelete("/{id}", DeleteMember)
    .WithName("DeleteMember")
    .WithOpenApi();

app.Run();

// Endpoint handlers
async Task<IResult> GetAllMembers(ApplicationDbContext db)
{
    var members = await db.Members.ToListAsync();
    return Results.Ok(new { data = members });
}

async Task<IResult> GetMemberById(int id, ApplicationDbContext db)
{
    var member = await db.Members.FindAsync(id);
    if (member == null)
        return Results.NotFound(new { error = "Member not found", code = "MEMBER_NOT_FOUND" });
    return Results.Ok(new { data = member });
}

async Task<IResult> CreateMember(CreateMemberDto dto, ApplicationDbContext db)
{
    if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.Surname) ||
        string.IsNullOrWhiteSpace(dto.PostalCode) || string.IsNullOrWhiteSpace(dto.MobileNumber))
    {
        return Results.BadRequest(new { error = "All fields are required", code = "VALIDATION_ERROR" });
    }

    var member = new Member
    {
        FirstName = dto.FirstName.Trim(),
        Surname = dto.Surname.Trim(),
        DateOfBirth = dto.DateOfBirth,
        PostalCode = dto.PostalCode.Trim(),
        MobileNumber = dto.MobileNumber.Trim()
    };

    db.Members.Add(member);
    await db.SaveChangesAsync();

    return Results.Created($"/api/members/{member.Id}", new { data = member });
}

async Task<IResult> UpdateMember(int id, UpdateMemberDto dto, ApplicationDbContext db)
{
    var member = await db.Members.FindAsync(id);
    if (member == null)
        return Results.NotFound(new { error = "Member not found", code = "MEMBER_NOT_FOUND" });

    if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.Surname) ||
        string.IsNullOrWhiteSpace(dto.PostalCode) || string.IsNullOrWhiteSpace(dto.MobileNumber))
    {
        return Results.BadRequest(new { error = "All fields are required", code = "VALIDATION_ERROR" });
    }

    member.FirstName = dto.FirstName.Trim();
    member.Surname = dto.Surname.Trim();
    member.DateOfBirth = dto.DateOfBirth;
    member.PostalCode = dto.PostalCode.Trim();
    member.MobileNumber = dto.MobileNumber.Trim();

    db.Members.Update(member);
    await db.SaveChangesAsync();

    return Results.Ok(new { data = member });
}

async Task<IResult> DeleteMember(int id, ApplicationDbContext db)
{
    var member = await db.Members.FindAsync(id);
    if (member == null)
        return Results.NotFound(new { error = "Member not found", code = "MEMBER_NOT_FOUND" });

    db.Members.Remove(member);
    await db.SaveChangesAsync();

    return Results.NoContent();
}

// Seed initial data
void SeedDatabase(ApplicationDbContext db)
{
    if (db.Members.Any())
        return;

    var members = new List<Member>
    {
        new Member
        {
            FirstName = "John",
            Surname = "Smith",
            DateOfBirth = new DateTime(1980, 5, 15),
            PostalCode = "SW1A 1AA",
            MobileNumber = "+44 7700 900001"
        },
        new Member
        {
            FirstName = "Jane",
            Surname = "Doe",
            DateOfBirth = new DateTime(1985, 8, 22),
            PostalCode = "E1 6AN",
            MobileNumber = "+44 7700 900002"
        },
        new Member
        {
            FirstName = "Robert",
            Surname = "Johnson",
            DateOfBirth = new DateTime(1975, 3, 10),
            PostalCode = "M1 1AE",
            MobileNumber = "+44 7700 900003"
        },
        new Member
        {
            FirstName = "Emily",
            Surname = "Brown",
            DateOfBirth = new DateTime(1992, 11, 30),
            PostalCode = "B33 8TH",
            MobileNumber = "+44 7700 900004"
        },
        new Member
        {
            FirstName = "Michael",
            Surname = "Wilson",
            DateOfBirth = new DateTime(1988, 6, 18),
            PostalCode = "LS1 3AA",
            MobileNumber = "+44 7700 900005"
        }
    };

    db.Members.AddRange(members);
    db.SaveChanges();
}

// DTOs
record CreateMemberDto(string FirstName, string Surname, DateTime DateOfBirth, string PostalCode, string MobileNumber);
record UpdateMemberDto(string FirstName, string Surname, DateTime DateOfBirth, string PostalCode, string MobileNumber);
