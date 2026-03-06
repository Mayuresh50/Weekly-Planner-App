using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IWeeklyPlanService
{
    Task<WeeklyPlanDto> CreatePlanAsync(CreateWeeklyPlanDto dto);
    Task<WeeklyPlanDto> FreezePlanAsync(Guid id);
    Task<WeeklyPlanDto?> GetCurrentPlanAsync();
    Task<IEnumerable<WeeklyPlanDto>> GetAllPlansAsync();
}
