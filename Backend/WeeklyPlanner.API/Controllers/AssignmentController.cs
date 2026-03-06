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
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<TaskAssignmentDto>> Assign([FromBody] CreateAssignmentDto dto)
    {
        return Ok(await _assignmentService.AssignTaskAsync(dto));
    }

    [HttpPatch("{id}/progress")]
    public async Task<ActionResult<TaskAssignmentDto>> UpdateProgress(Guid id, [FromBody] UpdateProgressDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        
        var userId = Guid.Parse(userIdStr);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        
        return Ok(await _assignmentService.UpdateProgressAsync(id, dto, userId, role));
    }
}
