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
        modelBuilder.HasDefaultContainer("WeeklyPlanner");

        // USERS
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToContainer("Users");
            entity.HasPartitionKey(u => u.Id);
            entity.HasKey(u => u.Id);
            entity.HasNoDiscriminator();
            entity.Property(u => u.Id).ToJsonProperty("id");
        });

        // BACKLOG ITEMS
        modelBuilder.Entity<BacklogItem>(entity =>
        {
            entity.ToContainer("BacklogItems");
            entity.HasPartitionKey(b => b.Id);
            entity.HasKey(b => b.Id);
            entity.HasNoDiscriminator();
            entity.Property(b => b.Id).ToJsonProperty("id");
        });

        // WEEKLY PLANS
        modelBuilder.Entity<WeeklyPlan>(entity =>
        {
            entity.ToContainer("WeeklyPlans");
            entity.HasPartitionKey(w => w.Id);
            entity.HasKey(w => w.Id);
            entity.HasNoDiscriminator();
            entity.Property(w => w.Id).ToJsonProperty("id");
        });

        // PLAN ALLOCATIONS
        modelBuilder.Entity<PlanAllocation>(entity =>
        {
            entity.ToContainer("PlanAllocations");
            entity.HasPartitionKey(p => p.WeeklyPlanId);
            entity.HasKey(p => p.Id);
            entity.HasNoDiscriminator();
            entity.Property(p => p.Id).ToJsonProperty("id");
        });

        // TASK ASSIGNMENTS
        modelBuilder.Entity<TaskAssignment>(entity =>
        {
            entity.ToContainer("Assignments");

            entity.HasPartitionKey(t => t.WeeklyPlanId);

            entity.HasKey(t => t.Id);

            entity.HasNoDiscriminator();

            entity.Property(t => t.Id)
                .ToJsonProperty("id");

            entity.Property(t => t.WeeklyPlanId)
                .ToJsonProperty("weeklyPlanId");

            entity.Property(t => t.UserId)
                .ToJsonProperty("userId");

            entity.Property(t => t.BacklogItemId)
                .ToJsonProperty("backlogItemId");

            entity.Property(t => t.AssignedHours)
                .ToJsonProperty("assignedHours");
        });

        base.OnModelCreating(modelBuilder);
    }

    public Task BeginTransactionAsync() => Task.CompletedTask;
    public Task CommitTransactionAsync() => Task.CompletedTask;
    public Task RollbackTransactionAsync() => Task.CompletedTask;
}