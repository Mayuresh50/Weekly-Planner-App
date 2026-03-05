using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<BacklogItem> BacklogItems { get; }
    DbSet<WeeklyPlan> WeeklyPlans { get; }
    DbSet<PlanAllocation> PlanAllocations { get; }
    DbSet<TaskAssignment> TaskAssignments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
