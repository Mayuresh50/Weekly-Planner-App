using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public DashboardController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardSummaryDto>> Get([FromQuery] Guid? weeklyPlanId, [FromQuery] DashboardFiltersDto filters)
    {
        if (weeklyPlanId.HasValue)
        {
            return Ok(await _assignmentService.GetDashboardSummaryAsync(weeklyPlanId.Value, filters));
        }
        
        return Ok(await _assignmentService.GetActiveDashboardSummaryAsync(filters));
    }
}
