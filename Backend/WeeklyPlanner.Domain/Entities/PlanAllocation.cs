using WeeklyPlanner.Domain.Common;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Domain.Entities;

public class PlanAllocation : BaseEntity
{
    public Guid WeeklyPlanId { get; set; }
    public WeeklyPlan WeeklyPlan { get; set; } = null!;
    
    public Category Category { get; set; }
    public decimal AllocatedHours { get; set; }
}
