using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<BacklogItem> BacklogItems => Set<BacklogItem>();
    public DbSet<WeeklyPlan> WeeklyPlans => Set<WeeklyPlan>();
    public DbSet<PlanAllocation> PlanAllocations => Set<PlanAllocation>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        
        // Precision for decimals
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        base.OnModelCreating(modelBuilder);
    }

    public async Task BeginTransactionAsync()
    {
        await Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        await Database.CommitTransactionAsync();
    }

    public async Task RollbackTransactionAsync()
    {
        await Database.RollbackTransactionAsync();
    }
}
