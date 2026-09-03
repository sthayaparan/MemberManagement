using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MemberManagementApi.Data;

namespace backend.Tests;

/// <summary>
/// Boots the real app with an isolated, file-based SQLite database per test class instance.
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

public class MembersEndpointsTests : IClassFixture<MemberApiFactory>
{
    private readonly HttpClient _client;

    public MembersEndpointsTests(MemberApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllMembers_ReturnsSeededMembers()
    {
        var response = await _client.GetAsync("/api/members");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MembersResponse>();
        Assert.True(body!.Data.Count >= 5);
    }

    [Fact]
    public async Task GetMemberById_UnknownId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/members/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateMember_ValidData_ReturnsCreated()
    {
        var request = new
        {
            firstName = "Test",
            surname = "User",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        };

        var response = await _client.PostAsJsonAsync("/api/members", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MemberResponse>();
        Assert.Equal("Test", body!.Data.FirstName);
    }

    [Theory]
    [InlineData("", "User")]
    [InlineData("Test", "")]
    public async Task CreateMember_MissingRequiredField_ReturnsBadRequest(string firstName, string surname)
    {
        var request = new
        {
            firstName,
            surname,
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        };

        var response = await _client.PostAsJsonAsync("/api/members", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
    public async Task UpdateMember_ExistingMember_ReturnsOk()
    {
        var created = await _client.PostAsJsonAsync("/api/members", new
        {
            firstName = "Before",
            surname = "Update",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        });
        var createdBody = await created.Content.ReadFromJsonAsync<MemberResponse>();

        var response = await _client.PutAsJsonAsync($"/api/members/{createdBody!.Data.Id}", new
        {
            firstName = "After",
            surname = "Update",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MemberResponse>();
        Assert.Equal("After", body!.Data.FirstName);
    }

    [Fact]
    public async Task UpdateMember_UnknownId_ReturnsNotFound()
    {
        var response = await _client.PutAsJsonAsync("/api/members/999999", new
        {
            firstName = "Test",
            surname = "User",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteMember_ExistingMember_ReturnsNoContentThenNotFound()
    {
        var created = await _client.PostAsJsonAsync("/api/members", new
        {
            firstName = "ToDelete",
            surname = "Member",
            dateOfBirth = "1990-01-01",
            postalCode = "AB1 2CD",
            mobileNumber = "07700900123"
        });
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

    private record MemberDto(int Id, string FirstName, string Surname, DateTime DateOfBirth, string PostalCode, string MobileNumber);
    private record MemberResponse(MemberDto Data);
    private record MembersResponse(List<MemberDto> Data);
}
