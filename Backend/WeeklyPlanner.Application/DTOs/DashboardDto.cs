using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Application.DTOs;

public class TaskAssignmentDto
{
    public Guid Id { get; set; }
    public Guid WeeklyPlanId { get; set; }
    public Guid BacklogItemId { get; set; }
    public string BacklogItemTitle { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal AssignedHours { get; set; }
    public int ProgressPercentage { get; set; }
    public BacklogStatus Status { get; set; }
}

public class CreateAssignmentDto
{
    public Guid WeeklyPlanId { get; set; }
    public Guid BacklogItemId { get; set; }
    public Guid UserId { get; set; }
    public decimal AssignedHours { get; set; }
}

public class DashboardFiltersDto
{
    public Guid? MemberId { get; set; }
    public Category? Category { get; set; }
    public BacklogStatus? Status { get; set; }
}

public class DashboardSummaryDto
{
    public WeeklyPlanSummaryDto PlanSummary { get; set; } = null!;
    public List<CategoryUtilizationDto> CategoryUtilization { get; set; } = new();
    public List<MemberProgressDto> MemberProgress { get; set; } = new();
    public List<TaskLevelProgressDto> TaskLevelProgress { get; set; } = new();
}

public class WeeklyPlanSummaryDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsFrozen { get; set; }
    public decimal TotalAvailable { get; set; }
    public decimal TotalPlanned { get; set; }
}

public class CategoryUtilizationDto
{
    public Category Category { get; set; }
    public decimal Allocated { get; set; }
    public decimal Used { get; set; }
    public decimal Percentage { get; set; }
}

public class MemberProgressDto
{
    public string Name { get; set; } = string.Empty;
    public int Tasks { get; set; }
    public int Completed { get; set; }
    public decimal TotalHours { get; set; }
}

public class TaskLevelProgressDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MemberName { get; set; } = string.Empty;
    public Category Category { get; set; }
    public BacklogStatus Status { get; set; }
    public int Progress { get; set; }
    public decimal Hours { get; set; }
}
