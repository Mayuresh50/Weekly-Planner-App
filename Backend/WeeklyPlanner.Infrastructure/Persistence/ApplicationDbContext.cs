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
        // USERS
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired();
        });

        // BACKLOG ITEMS
        modelBuilder.Entity<BacklogItem>(entity =>
        {
            entity.HasKey(b => b.Id);
        });

        // WEEKLY PLANS
        modelBuilder.Entity<WeeklyPlan>(entity =>
        {
            entity.HasKey(w => w.Id);
        });

        // PLAN ALLOCATIONS
        modelBuilder.Entity<PlanAllocation>(entity =>
        {
            entity.HasKey(p => p.Id);
        });

        // TASK ASSIGNMENTS
        modelBuilder.Entity<TaskAssignment>(entity =>
        {
            entity.HasKey(t => t.Id);
        });

        base.OnModelCreating(modelBuilder);
    }

    public async Task BeginTransactionAsync() => await Database.BeginTransactionAsync();
    public async Task CommitTransactionAsync() => await Database.CommitTransactionAsync();
    public async Task RollbackTransactionAsync() => await Database.RollbackTransactionAsync();
}