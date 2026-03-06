using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.Application.Common.Interfaces;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DevController : ControllerBase
{
    private readonly IDevService _devService;

    public DevController(IDevService devService)
    {
        _devService = devService;
    }

    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        await _devService.SeedDataAsync();
        return Ok(new { message = "Sample data seeded successfully." });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        await _devService.ResetDataAsync();
        return Ok(new { message = "Application state has been reset." });
    }

    [HttpGet("export")]
    public async Task<ActionResult<ExportDataDto>> Export()
    {
        return Ok(await _devService.ExportDataAsync());
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] ExportDataDto data)
    {
        await _devService.ImportDataAsync(data);
        return Ok(new { message = "Data imported successfully." });
    }
}
