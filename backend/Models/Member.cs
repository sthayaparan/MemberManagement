namespace MemberManagementApi.Models;

/// <summary>
/// Represents a member in the system.
/// </summary>
public class Member
{
    /// <summary>
    /// Unique identifier for the member.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Member's first name.
    /// </summary>
    public required string FirstName { get; set; }

    /// <summary>
    /// Member's surname/last name.
    /// </summary>
    public required string Surname { get; set; }

    /// <summary>
    /// Member's date of birth (ISO 8601 format).
    /// </summary>
    public DateTime DateOfBirth { get; set; }

    /// <summary>
    /// Member's postal code.
    /// </summary>
    public required string PostalCode { get; set; }

    /// <summary>
    /// Member's mobile phone number.
    /// </summary>
    public required string MobileNumber { get; set; }

    /// <summary>
    /// Timestamp when the member was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the member was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
