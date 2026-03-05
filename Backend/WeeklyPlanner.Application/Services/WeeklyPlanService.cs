using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;
using WeeklyPlanner.Application.Common.Exceptions;

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
        // 1. Handle overlapping plans (Strategy Re-initialization)
        var overlaps = await _context.WeeklyPlans
            .Include(p => p.Assignments)
            .Where(p => (p.StartDate <= dto.EndDate && p.EndDate >= dto.StartDate))
            .ToListAsync();

        if (overlaps.Any())
        {
            if (overlaps.Any(p => p.IsFrozen))
                throw new BusinessException("A frozen weekly plan already exists for this period. Frozen plans cannot be re-initialized.");

            // Cleanup non-frozen overlaps
            foreach (var oldPlan in overlaps)
            {
                // Reset Backlog Item statuses for all assignments in the old plan
                var backlogItemIds = oldPlan.Assignments.Select(a => a.BacklogItemId).ToList();
                var backlogItems = await _context.BacklogItems
                    .Where(bi => backlogItemIds.Contains(bi.Id))
                    .ToListAsync();
                
                foreach (var item in backlogItems)
                {
                    item.Status = BacklogStatus.Backlog;
                }

                _context.WeeklyPlans.Remove(oldPlan);
            }
            await _context.SaveChangesAsync();
        }

        // 2. Validate total percentage
        if (dto.ClientPercentage + dto.TechDebtPercentage + dto.RndPercentage != 100)
            throw new BusinessException("Allocation percentages must equal 100%");

        // 3. Calculate capacity based on TEAM_MEMBER users
        var memberCount = await _context.Users.CountAsync(u => u.Role == Role.TeamMember);
        var totalCapacity = memberCount * 30;

        var plan = _mapper.Map<WeeklyPlan>(dto);
        plan.TotalAvailableHours = totalCapacity;

        // 4. Create allocations with decimal precision
        plan.Allocations = new List<PlanAllocation>
        {
            new() { Category = Category.Client, AllocatedHours = totalCapacity * dto.ClientPercentage / 100.0m },
            new() { Category = Category.TechDebt, AllocatedHours = totalCapacity * dto.TechDebtPercentage / 100.0m },
            new() { Category = Category.RnD, AllocatedHours = totalCapacity * dto.RndPercentage / 100.0m }
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
