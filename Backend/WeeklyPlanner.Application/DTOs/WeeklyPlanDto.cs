using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Application.DTOs;

public class WeeklyPlanDto
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsFrozen { get; set; }
    public decimal ClientPercentage { get; set; }
    public decimal TechDebtPercentage { get; set; }
    public decimal RndPercentage { get; set; }
    public decimal TotalAvailableHours { get; set; }
    public List<PlanAllocationDto> Allocations { get; set; } = new();
}

public class PlanAllocationDto
{
    public Category Category { get; set; }
    public decimal AllocatedHours { get; set; }
}

public class CreateWeeklyPlanDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal ClientPercentage { get; set; }
    public decimal TechDebtPercentage { get; set; }
    public decimal RndPercentage { get; set; }
}
