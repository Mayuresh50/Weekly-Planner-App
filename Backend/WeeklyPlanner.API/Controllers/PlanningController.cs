using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PlanningController : ControllerBase
{
    private readonly IWeeklyPlanService _planningService;

    public PlanningController(IWeeklyPlanService planningService)
    {
        _planningService = planningService;
    }

    [HttpPost]
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<WeeklyPlanDto>> Create(CreateWeeklyPlanDto dto)
    {
        return Ok(await _planningService.CreatePlanAsync(dto));
    }

    [HttpPost("{id}/freeze")]
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<WeeklyPlanDto>> Freeze(Guid id)
    {
        return Ok(await _planningService.FreezePlanAsync(id));
    }

    [HttpGet("current")]
    public async Task<ActionResult<WeeklyPlanDto>> GetCurrent()
    {
        return Ok(await _planningService.GetCurrentPlanAsync());
    }
}
