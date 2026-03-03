using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpPost]
    public async Task<ActionResult<TaskAssignmentDto>> Assign(CreateAssignmentDto dto)
    {
        return Ok(await _assignmentService.AssignTaskAsync(dto));
    }

    [HttpPatch("{id}/progress")]
    public async Task<ActionResult<TaskAssignmentDto>> UpdateProgress(Guid id, [FromBody] int progressPercentage)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;
        return Ok(await _assignmentService.UpdateProgressAsync(id, progressPercentage, userId, role));
    }

    [HttpGet("{weeklyPlanId}/summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(Guid weeklyPlanId, [FromQuery] DashboardFiltersDto filters)
    {
        return Ok(await _assignmentService.GetDashboardSummaryAsync(weeklyPlanId, filters));
    }
}
