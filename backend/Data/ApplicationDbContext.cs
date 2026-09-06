using Microsoft.EntityFrameworkCore;
using MemberManagementApi.Models;

namespace MemberManagementApi.Data;

/// <summary>
/// Entity Framework Core database context for the Member Management API.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// DbSet for members.
    /// </summary>
    public DbSet<Member> Members { get; set; } = null!;

    /// <summary>
    /// Configures the model on model creating.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Member entity
        var memberEntity = modelBuilder.Entity<Member>();

        // Set primary key
        memberEntity.HasKey(m => m.Id);

        // Configure properties
        memberEntity.Property(m => m.Id).ValueGeneratedOnAdd();
        memberEntity.Property(m => m.FirstName).IsRequired().HasMaxLength(100);
        memberEntity.Property(m => m.Surname).IsRequired().HasMaxLength(100);
        memberEntity.Property(m => m.DateOfBirth).IsRequired();
        memberEntity.Property(m => m.PostalCode).IsRequired().HasMaxLength(20);
        memberEntity.Property(m => m.MobileNumber).IsRequired().HasMaxLength(20);
        memberEntity.Property(m => m.CreatedAt).IsRequired();
        memberEntity.Property(m => m.UpdatedAt).IsRequired();
    }

    /// <summary>
    /// Override SaveChanges to update the UpdatedAt timestamp.
    /// </summary>
    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    /// <summary>
    /// Override SaveChangesAsync to update the UpdatedAt timestamp.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Stamps CreatedAt on new members and UpdatedAt on new or modified members,
    /// all from a single clock reading so the values stay consistent.
    /// </summary>
    private void UpdateTimestamps()
    {
        var now = DateTime.UtcNow;
        var entries = ChangeTracker.Entries<Member>()
            .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = now;
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
        }
    }
}
