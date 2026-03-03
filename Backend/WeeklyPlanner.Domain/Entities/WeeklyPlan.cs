using WeeklyPlanner.Domain.Common;

namespace WeeklyPlanner.Domain.Entities;

public class WeeklyPlan : BaseEntity
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsFrozen { get; set; }
    
    public decimal ClientPercentage { get; set; }
    public decimal TechDebtPercentage { get; set; }
    public decimal RndPercentage { get; set; }
    
    public decimal TotalAvailableHours { get; set; } = 30;

    public ICollection<PlanAllocation> Allocations { get; set; } = new List<PlanAllocation>();
    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
}
