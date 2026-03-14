using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;
using WeeklyPlanner.Application.Common.Exceptions;

namespace WeeklyPlanner.Application.Services;

public class AssignmentService : IAssignmentService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AssignmentService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TaskAssignmentDto> AssignTaskAsync(CreateAssignmentDto dto)
    {
        if (dto == null) throw new BusinessException("Assignment data is required.");

        var now = DateTime.UtcNow;
        var plans = await _context.WeeklyPlans.ToListAsync();
        var plan = plans.FirstOrDefault(p => p.StartDate <= now && p.EndDate >= now);

        if (plan == null) 
            throw new BusinessException("No active weekly plan found for the current date.");
        
        if (plan.IsFrozen) 
            throw new BusinessException("The current weekly plan is frozen and cannot be modified.");

        var allocations = await _context.PlanAllocations
            .Where(a => a.WeeklyPlanId == plan.Id)
            .ToListAsync();

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null) 
            throw new BusinessException("The assigned user does not exist.");
        
        if (user.Role != Role.TeamMember)
            throw new BusinessException("Assignments can ONLY be given to team members.");

        var backlogItem = await _context.BacklogItems.FindAsync(dto.BacklogItemId);
        if (backlogItem == null) 
            throw new BusinessException("The selected backlog item was not found.");
        
        if (backlogItem.Status != BacklogStatus.Backlog)
            throw new BusinessException("Only items currently in the 'Backlog' can be assigned.");

        var existingAssignments = await _context.TaskAssignments
            .Where(a => a.WeeklyPlanId == plan.Id && a.UserId == user.Id)
            .ToListAsync();

        var currentAssignedTotal = existingAssignments.Sum(a => a.AssignedHours);

        if (currentAssignedTotal + dto.AssignedHours > 30)
            throw new BusinessException($"Member {user.Name} cannot exceed 30 hours per week.");

        var categoryAllocation = allocations.FirstOrDefault(a => a.Category == backlogItem.Category);
        if (categoryAllocation == null) 
            throw new BusinessException($"No allocation found for category {backlogItem.Category}");

        var categoryUsedHours = await _context.TaskAssignments
            .Where(a => a.WeeklyPlanId == plan.Id)
            .Join(_context.BacklogItems.Where(bi => bi.Category == backlogItem.Category), 
                a => a.BacklogItemId, bi => bi.Id, (a, bi) => a.AssignedHours)
            .SumAsync();

        if (categoryUsedHours + dto.AssignedHours > categoryAllocation.AllocatedHours)
            throw new BusinessException($"Category '{backlogItem.Category}' allocation exceeded.");

        var assignment = new TaskAssignment
        {
            Id = Guid.NewGuid(),
            BacklogItemId = backlogItem.Id,
            UserId = user.Id,
            WeeklyPlanId = plan.Id,
            AssignedHours = dto.AssignedHours,
            Status = BacklogStatus.Planned,
            ProgressPercentage = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.TaskAssignments.Add(assignment);
        backlogItem.Status = BacklogStatus.Planned;
        
        await _context.SaveChangesAsync();
        
        assignment.BacklogItem = backlogItem;
        assignment.User = user;
            
        return _mapper.Map<TaskAssignmentDto>(assignment);
    }

    public async Task<TaskAssignmentDto> UpdateProgressAsync(Guid id, UpdateProgressDto dto, Guid userId, string userRole)
    {
        if (dto == null) throw new BusinessException("Progress data is required.");

        var assignment = await _context.TaskAssignments.FirstOrDefaultAsync(a => a.Id == id);
        if (assignment == null) 
            throw new BusinessException("Assignment not found.");

        var plan = await _context.WeeklyPlans.FindAsync(assignment.WeeklyPlanId);
        if (plan == null) throw new BusinessException("Weekly plan not found.");

        if (plan.IsFrozen) 
            throw new BusinessException("Cannot update progress on a frozen weekly plan.");

        if (userRole == Role.TeamMember.ToString() && assignment.UserId != userId)
            throw new BusinessException("Access denied. Members can only update their own assigned tasks.");

        var progress = dto.ProgressPercentage;
        if (progress < 0 || progress > 100)
            throw new BusinessException("Progress must be between 0 and 100.");

        assignment.ProgressPercentage = progress;
        assignment.Status = progress switch
        {
            100 => BacklogStatus.Completed,
            0 => BacklogStatus.Planned,
            _ => BacklogStatus.InProgress
        };

        var backlogItem = await _context.BacklogItems.FindAsync(assignment.BacklogItemId);
        if (backlogItem != null)
        {
            backlogItem.Status = assignment.Status;
        }

        await _context.SaveChangesAsync();
        
        assignment.BacklogItem = backlogItem!;
        assignment.User = await _context.Users.FindAsync(assignment.UserId) ?? null!;
        
        return _mapper.Map<TaskAssignmentDto>(assignment);
    }

    public async Task<DashboardSummaryDto> GetActiveDashboardSummaryAsync(DashboardFiltersDto filters)
    {
        var now = DateTime.UtcNow;
        var plan = await _context.WeeklyPlans
            .Where(p => p.StartDate <= now && p.EndDate >= now)
            .FirstOrDefaultAsync();

        if (plan == null)
        {
            plan = await _context.WeeklyPlans
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();
        }

        if (plan == null) return new DashboardSummaryDto();

        return await GetDashboardSummaryAsync(plan.Id, filters);
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid weeklyPlanId, DashboardFiltersDto filters)
    {
        var plan = await _context.WeeklyPlans.FindAsync(weeklyPlanId);
        if (plan == null) throw new BusinessException("Plan not found");

        var allocations = await _context.PlanAllocations.Where(a => a.WeeklyPlanId == weeklyPlanId).ToListAsync();
        var query = _context.TaskAssignments.Where(a => a.WeeklyPlanId == weeklyPlanId);
        
        if (filters.MemberId.HasValue) 
            query = query.Where(a => a.UserId == filters.MemberId.Value);

        if (filters.Status.HasValue)
            query = query.Where(a => a.Status == filters.Status.Value);

        var finalItems = await query
            .Join(_context.BacklogItems, a => a.BacklogItemId, bi => bi.Id, (a, bi) => new { a, bi })
            .Join(_context.Users, x => x.a.UserId, u => u.Id, (x, u) => new { x.a, x.bi, u })
            .Where(x => !filters.Category.HasValue || x.bi.Category == filters.Category.Value)
            .Select(x => new {
                x.a.Id,
                x.bi.Title,
                MemberName = x.u.Name,
                x.bi.Category,
                x.a.Status,
                Progress = x.a.ProgressPercentage,
                Hours = x.a.AssignedHours,
                x.a.UserId
            })
            .ToListAsync();

        return new DashboardSummaryDto
        {
            PlanSummary = new WeeklyPlanSummaryDto
            {
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                IsFrozen = plan.IsFrozen,
                TotalAvailable = plan.TotalAvailableHours,
                TotalPlanned = await _context.TaskAssignments
                    .Where(a => a.WeeklyPlanId == weeklyPlanId)
                    .SumAsync(a => a.AssignedHours)
            },
            CategoryUtilization = allocations.Select(alloc => 
            {
                var used = finalItems
                    .Where(x => x.Category == alloc.Category)
                    .Sum(x => x.Hours);
                
                return new CategoryUtilizationDto
                {
                    Category = alloc.Category,
                    Allocated = alloc.AllocatedHours,
                    Used = used,
                    Percentage = alloc.AllocatedHours > 0 ? (used / alloc.AllocatedHours) * 100 : 0
                };
            }).ToList(),
            MemberProgress = finalItems
                .GroupBy(x => new { x.UserId, x.MemberName })
                .Select(g => new MemberProgressDto
                {
                    Name = g.Key.MemberName,
                    Tasks = g.Count(),
                    Completed = g.Count(x => x.Status == BacklogStatus.Completed),
                    TotalHours = g.Sum(x => x.Hours)
                }).ToList(),
            TaskLevelProgress = finalItems.Select(x => new TaskLevelProgressDto
            {
                Id = x.Id,
                Title = x.Title,
                MemberName = x.MemberName,
                Category = x.Category,
                Status = x.Status,
                Progress = x.Progress,
                Hours = x.Hours
            }).ToList()
        };
    }

    public async Task<IEnumerable<TaskAssignmentDto>> GetMyAssignmentsAsync(Guid userId)
    {
        var result = await _context.TaskAssignments
            .Where(a => a.UserId == userId)
            .Join(_context.BacklogItems, a => a.BacklogItemId, bi => bi.Id, (a, bi) => new { a, bi })
            .Join(_context.Users, x => x.a.UserId, u => u.Id, (x, u) => new { x.a, x.bi, u })
            .Select(x => new TaskAssignmentDto
            {
                Id = x.a.Id,
                BacklogItemId = x.a.BacklogItemId,
                WeeklyPlanId = x.a.WeeklyPlanId,
                UserId = x.a.UserId,
                AssignedHours = x.a.AssignedHours,
                Status = x.a.Status,
                ProgressPercentage = x.a.ProgressPercentage,
                CreatedAt = x.a.CreatedAt,
                BacklogItemTitle = x.bi.Title,
                UserName = x.u.Name
            })
            .ToListAsync();

        return result;
    }
}
