using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Application.Services;

public class WeeklyPlanService : IWeeklyPlanService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public WeeklyPlanService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<WeeklyPlanDto> CreatePlanAsync(CreateWeeklyPlanDto dto)
    {
        // 1. Check for overlapping plans
        var exists = await _context.WeeklyPlans.AnyAsync(p => 
            (p.StartDate <= dto.EndDate && p.EndDate >= dto.StartDate));
            
        if (exists) throw new Exception("A plan already exists for this date range.");

        // 2. Validate total percentage
        if (dto.ClientPercentage + dto.TechDebtPercentage + dto.RndPercentage != 100)
            throw new Exception("Total allocation percentage must equal 100%.");

        var plan = _mapper.Map<WeeklyPlan>(dto);
        plan.TotalAvailableHours = 30;

        // 3. Create allocations
        plan.Allocations = new List<PlanAllocation>
        {
            new() { Category = Category.Client, AllocatedHours = 30 * dto.ClientPercentage / 100 },
            new() { Category = Category.TechDebt, AllocatedHours = 30 * dto.TechDebtPercentage / 100 },
            new() { Category = Category.RnD, AllocatedHours = 30 * dto.RndPercentage / 100 }
        };

        _context.WeeklyPlans.Add(plan);
        await _context.SaveChangesAsync();
        return _mapper.Map<WeeklyPlanDto>(plan);
    }

    public async Task<WeeklyPlanDto> FreezePlanAsync(Guid id)
    {
        var plan = await _context.WeeklyPlans.FindAsync(id);
        if (plan == null) throw new Exception("Plan not found");

        plan.IsFrozen = true;
        await _context.SaveChangesAsync();
        return _mapper.Map<WeeklyPlanDto>(plan);
    }

    public async Task<WeeklyPlanDto?> GetCurrentPlanAsync()
    {
        var now = DateTime.UtcNow;
        var plan = await _context.WeeklyPlans
            .Include(p => p.Allocations)
            .FirstOrDefaultAsync(p => p.StartDate <= now && p.EndDate >= now);
            
        return plan == null ? null : _mapper.Map<WeeklyPlanDto>(plan);
    }
}
