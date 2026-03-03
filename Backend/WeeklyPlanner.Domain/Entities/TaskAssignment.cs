using WeeklyPlanner.Domain.Common;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Domain.Entities;

public class TaskAssignment : BaseEntity
{
    public Guid WeeklyPlanId { get; set; }
    public WeeklyPlan WeeklyPlan { get; set; } = null!;

    public Guid BacklogItemId { get; set; }
    public BacklogItem BacklogItem { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal AssignedHours { get; set; }
    public int ProgressPercentage { get; set; } = 0;
    public BacklogStatus Status { get; set; } = BacklogStatus.Planned;
}
