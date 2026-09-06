using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MemberManagementApi.Data;

namespace backend.Tests;

/// <summary>
/// Boots the real app with an isolated, file-based SQLite database.
/// </summary>
public class MemberApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"members-test-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite($"Data Source={_dbPath}"));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        // SQLite pools native connections by connection string; clear them so the file can be deleted.
        SqliteConnection.ClearAllPools();
        if (File.Exists(_dbPath))
            File.Delete(_dbPath);
    }
}

/// <summary>
/// One factory (and one fresh temp database) per test method, so tests never
/// see each other's writes.
/// </summary>
public class MembersEndpointsTests : IDisposable
{
    private readonly MemberApiFactory _factory = new();
    private readonly HttpClient _client;

    public MembersEndpointsTests()
    {
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private record MemberDto(int Id, string FirstName, string Surname, DateTime DateOfBirth, string PostalCode, string MobileNumber, DateTime CreatedAt, DateTime UpdatedAt);
    private record MemberResponse(MemberDto Data);
    private record MembersResponse(List<MemberDto> Data);
    private record ErrorResponse(string Error, string Code);

    private static object ValidRequest(string firstName = "Test", string surname = "User") => new
    {
        firstName,
        surname,
        dateOfBirth = "1990-01-01",
        postalCode = "AB1 2CD",
        mobileNumber = "07700900123"
    };

    [Fact]
    public async Task Health_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAllMembers_ReturnsSeededMembers()
    {
        var response = await _client.GetAsync("/api/members");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MembersResponse>();
        Assert.Equal(5, body!.Data.Count);
    }

    [Fact]
    public async Task GetMemberById_ExistingMember_ReturnsMember()
    {
        var response = await _client.GetAsync("/api/members/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MemberResponse>();
        Assert.Equal(1, body!.Data.Id);
        Assert.False(string.IsNullOrWhiteSpace(body.Data.FirstName));
    }

    [Fact]
    public async Task GetMemberById_UnknownId_ReturnsNotFoundEnvelope()
    {
        var response = await _client.GetAsync("/api/members/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.Equal("MEMBER_NOT_FOUND", body!.Code);
    }

    [Fact]
    public async Task CreateMember_ValidData_ReturnsCreatedWithTimestamps()
    {
        var response = await _client.PostAsJsonAsync("/api/members", ValidRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MemberResponse>();
        Assert.Equal("Test", body!.Data.FirstName);
        Assert.NotEqual(default, body.Data.CreatedAt);
        Assert.NotEqual(default, body.Data.UpdatedAt);
        Assert.EndsWith($"/api/members/{body.Data.Id}", response.Headers.Location!.ToString());
    }

    [Theory]
    [InlineData("", "User")]
    [InlineData("Test", "")]
    [InlineData("   ", "User")]
    public async Task CreateMember_MissingOrBlankRequiredField_ReturnsBadRequest(string firstName, string surname)
    {
        var response = await _client.PostAsJsonAsync("/api/members", ValidRequest(firstName, surname));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.Equal("VALIDATION_ERROR", body!.Code);
    }

    [Fact]
    public async Task CreateMember_FutureDateOfBirth_ReturnsBadRequest()
    {
        var request = new
        {
            firstName = "Test",
            surname = "User",
            dateOfBirth = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd"),
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        };

        var response = await _client.PostAsJsonAsync("/api/members", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateMember_OverlongName_ReturnsBadRequest()
    {
        var request = new
        {
            firstName = new string('a', 101),
            surname = "User",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        };

        var response = await _client.PostAsJsonAsync("/api/members", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateMember_ExistingMember_ReturnsOkAndBumpsUpdatedAt()
    {
        var created = await _client.PostAsJsonAsync("/api/members", ValidRequest("Before"));
        var createdBody = await created.Content.ReadFromJsonAsync<MemberResponse>();

        var response = await _client.PutAsJsonAsync($"/api/members/{createdBody!.Data.Id}", ValidRequest("After"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MemberResponse>();
        Assert.Equal("After", body!.Data.FirstName);
        Assert.True(body.Data.UpdatedAt >= createdBody.Data.UpdatedAt);
    }

    [Fact]
    public async Task UpdateMember_UnknownId_ReturnsNotFound()
    {
        var response = await _client.PutAsJsonAsync("/api/members/999999", ValidRequest());

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateMember_InvalidBody_ReturnsBadRequest()
    {
        var response = await _client.PutAsJsonAsync("/api/members/1", new
        {
            firstName = "",
            surname = "User",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteMember_ExistingMember_ReturnsNoContentThenNotFound()
    {
        var created = await _client.PostAsJsonAsync("/api/members", ValidRequest("ToDelete"));
        var createdBody = await created.Content.ReadFromJsonAsync<MemberResponse>();

        var deleteResponse = await _client.DeleteAsync($"/api/members/{createdBody!.Data.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/members/{createdBody.Data.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteMember_UnknownId_ReturnsNotFound()
    {
        var response = await _client.DeleteAsync("/api/members/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
