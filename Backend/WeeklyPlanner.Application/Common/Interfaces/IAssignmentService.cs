using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IAssignmentService
{
    Task<TaskAssignmentDto> AssignTaskAsync(CreateAssignmentDto dto);
    Task<TaskAssignmentDto> UpdateProgressAsync(Guid id, int progressPercentage, Guid userId, string userRole);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid weeklyPlanId, DashboardFiltersDto filters);
}
