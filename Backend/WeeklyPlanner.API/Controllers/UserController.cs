using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IAuthService _authService;

    public UserController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("members")]
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetMembers()
    {
        return Ok(await _authService.GetTeamMembersAsync());
    }

    [HttpPost("members")]
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<AuthResponseDto>> RegisterMember(RegisterDto dto)
    {
        // Force role to TeamMember for this endpoint
        dto.Role = WeeklyPlanner.Domain.Enums.Role.TeamMember;
        return Ok(await _authService.RegisterAsync(dto));
    }

    [HttpDelete("members/{id}")]
    [Authorize(Roles = "TeamLead")]
    public async Task<IActionResult> DeleteMember(Guid id)
    {
        var success = await _authService.DeleteUserAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
