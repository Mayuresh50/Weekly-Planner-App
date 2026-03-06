using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IDevService
{
    Task SeedDataAsync();
    Task ResetDataAsync();
    Task<ExportDataDto> ExportDataAsync();
    Task ImportDataAsync(ExportDataDto data);
}

public class ExportDataDto
{
    public List<UserDto> Users { get; set; } = new();
    public List<WeeklyPlanDto> WeeklyPlans { get; set; } = new();
    public List<BacklogItemDto> BacklogItems { get; set; } = new();
    public List<TaskAssignmentDto> Assignments { get; set; } = new();
}
