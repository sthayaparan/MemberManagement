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
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("{Method} {Path}", context.Request.Method, context.Request.Path);
    await next();
    logger.LogInformation("Response: {StatusCode}", context.Response.StatusCode);
});

// Use CORS
app.UseCors("AllowFrontend");

// Remove HTTPS redirection for local development
// app.UseHttpsRedirection();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck");

// Member endpoints
var memberGroup = app.MapGroup("/api/members")
    .WithTags("Members");

// GET all members
memberGroup.MapGet("/", GetAllMembers)
    .WithName("GetAllMembers");

// GET member by ID
memberGroup.MapGet("/{id}", GetMemberById)
    .WithName("GetMemberById");

// POST create member
memberGroup.MapPost("/", CreateMember)
    .WithName("CreateMember");

// PUT update member
memberGroup.MapPut("/{id}", UpdateMember)
    .WithName("UpdateMember");

// DELETE member
memberGroup.MapDelete("/{id}", DeleteMember)
    .WithName("DeleteMember");

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

async Task<IResult> CreateMember(MemberRequestDto dto, ApplicationDbContext db)
{
    var validationError = ValidateMember(dto);
    if (validationError != null)
        return Results.BadRequest(new { error = validationError, code = "VALIDATION_ERROR" });

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

async Task<IResult> UpdateMember(int id, MemberRequestDto dto, ApplicationDbContext db)
{
    var member = await db.Members.FindAsync(id);
    if (member == null)
        return Results.NotFound(new { error = "Member not found", code = "MEMBER_NOT_FOUND" });

    var validationError = ValidateMember(dto);
    if (validationError != null)
        return Results.BadRequest(new { error = validationError, code = "VALIDATION_ERROR" });

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

// Shared validation for create/update requests. Returns an error message, or null if valid.
string? ValidateMember(MemberRequestDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.Surname) ||
        string.IsNullOrWhiteSpace(dto.PostalCode) || string.IsNullOrWhiteSpace(dto.MobileNumber))
    {
        return "All fields are required";
    }

    if (dto.DateOfBirth == default || dto.DateOfBirth.Date > DateTime.UtcNow.Date)
    {
        return "Date of birth must be a valid date not in the future";
    }

    return null;
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
record MemberRequestDto(string FirstName, string Surname, DateTime DateOfBirth, string PostalCode, string MobileNumber);

// Exposes the top-level Program for WebApplicationFactory in tests.
public partial class Program;
