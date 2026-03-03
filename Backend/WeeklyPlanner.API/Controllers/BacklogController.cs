using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BacklogController : ControllerBase
{
    private readonly IBacklogService _backlogService;

    public BacklogController(IBacklogService backlogService)
    {
        _backlogService = backlogService;
    }

    [HttpPost]
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<BacklogItemDto>> Create(CreateBacklogItemDto dto)
    {
        return Ok(await _backlogService.CreateItemAsync(dto));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BacklogItemDto>>> GetAll()
    {
        return Ok(await _backlogService.GetAllItemsAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BacklogItemDto>> Get(Guid id)
    {
        return Ok(await _backlogService.GetItemAsync(id));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "TeamLead")]
    public async Task<ActionResult<BacklogItemDto>> Update(Guid id, UpdateBacklogItemDto dto)
    {
        return Ok(await _backlogService.UpdateItemAsync(id, dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "TeamLead")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _backlogService.DeleteItemAsync(id);
        return NoContent();
    }
}
