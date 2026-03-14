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
        if (dto == null) throw new BusinessException("Plan data is required.");

        var overlaps = await _context.WeeklyPlans
            .Where(p => p.StartDate <= dto.EndDate && p.EndDate >= dto.StartDate)
            .ToListAsync();

        if (overlaps.Any())
        {
            if (overlaps.Any(p => p.IsFrozen))
                throw new BusinessException("A frozen weekly plan already exists for this period.");

            foreach (var oldPlan in overlaps)
            {
                var assignments = await _context.TaskAssignments
                    .Where(a => a.WeeklyPlanId == oldPlan.Id)
                    .ToListAsync();

                var backlogItemIds = assignments.Select(a => a.BacklogItemId).ToList();
                var backlogItems = await _context.BacklogItems.ToListAsync();
                var itemsToReset = backlogItems.Where(bi => backlogItemIds.Contains(bi.Id)).ToList();
                
                foreach (var item in itemsToReset)
                {
                    item.Status = BacklogStatus.Backlog;
                }

                foreach (var assignment in assignments)
                {
                    _context.TaskAssignments.Remove(assignment);
                }

                var oldAllocations = await _context.PlanAllocations
                    .Where(a => a.WeeklyPlanId == oldPlan.Id)
                    .ToListAsync();
                
                foreach (var alloc in oldAllocations)
                {
                    _context.PlanAllocations.Remove(alloc);
                }

                _context.WeeklyPlans.Remove(oldPlan);
            }
            await _context.SaveChangesAsync();
        }

        if (dto.ClientPercentage + dto.TechDebtPercentage + dto.RndPercentage != 100)
            throw new BusinessException("Allocation percentages must equal 100%");

        var allUsers = await _context.Users.ToListAsync();
        var memberCount = allUsers.Count(u => u.Role == Role.TeamMember);
        var totalCapacity = memberCount * 30;

        var plan = _mapper.Map<WeeklyPlan>(dto);
        plan.TotalAvailableHours = totalCapacity;

        _context.WeeklyPlans.Add(plan);
        await _context.SaveChangesAsync();

        var allocations = new List<PlanAllocation>
        {
            new() { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, Category = Category.Client, AllocatedHours = totalCapacity * dto.ClientPercentage / 100.0m },
            new() { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, Category = Category.TechDebt, AllocatedHours = totalCapacity * dto.TechDebtPercentage / 100.0m },
            new() { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, Category = Category.RnD, AllocatedHours = totalCapacity * dto.RndPercentage / 100.0m }
        };

        foreach (var alloc in allocations)
        {
            _context.PlanAllocations.Add(alloc);
        }

        await _context.SaveChangesAsync();
        
        var result = _mapper.Map<WeeklyPlanDto>(plan);
        result.Allocations = _mapper.Map<List<PlanAllocationDto>>(allocations);
        
        return result;
    }

    public async Task<WeeklyPlanDto> FreezePlanAsync(Guid id)
    {
        var plan = await _context.WeeklyPlans.FindAsync(id);
        if (plan == null) throw new BusinessException("Plan not found");

        plan.IsFrozen = true;
        await _context.SaveChangesAsync();
        return _mapper.Map<WeeklyPlanDto>(plan);
    }

    public async Task<WeeklyPlanDto?> GetCurrentPlanAsync()
    {
        var now = DateTime.UtcNow;
        var plan = await _context.WeeklyPlans
            .FirstOrDefaultAsync(p => p.StartDate <= now && p.EndDate >= now);
            
        if (plan == null) return null;

        var dto = _mapper.Map<WeeklyPlanDto>(plan);
        var allocations = await _context.PlanAllocations
            .Where(a => a.WeeklyPlanId == plan.Id)
            .ToListAsync();
        
        var assignments = await _context.TaskAssignments
            .Where(a => a.WeeklyPlanId == plan.Id)
            .ToListAsync();
        
        dto.Allocations = _mapper.Map<List<PlanAllocationDto>>(allocations);
        dto.TotalPlannedHours = assignments.Sum(a => a.AssignedHours);
        
        return dto;
    }

    public async Task<IEnumerable<WeeklyPlanDto>> GetAllPlansAsync()
    {
        var plans = await _context.WeeklyPlans
            .OrderByDescending(p => p.StartDate)
            .ToListAsync();
            
        var dtos = _mapper.Map<List<WeeklyPlanDto>>(plans);

        foreach (var dto in dtos)
        {
            dto.TotalPlannedHours = await _context.TaskAssignments
                .Where(a => a.WeeklyPlanId == dto.Id)
                .SumAsync(a => a.AssignedHours);
        }

        return dtos;
    }
}
