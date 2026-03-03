using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;

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
        var plan = await _context.WeeklyPlans.Include(p => p.Allocations).FirstOrDefaultAsync(p => p.Id == dto.WeeklyPlanId);
        if (plan == null) throw new Exception("Weekly plan not found");
        if (plan.IsFrozen) throw new Exception("Plan is frozen. No assignments allowed.");

        var backlogItem = await _context.BacklogItems.FindAsync(dto.BacklogItemId);
        if (backlogItem == null) throw new Exception("Backlog item not found");

        // 1. Check member limit (30h)
        var memberTotalHours = await _context.TaskAssignments
            .Where(a => a.WeeklyPlanId == dto.WeeklyPlanId && a.UserId == dto.UserId)
            .SumAsync(a => a.AssignedHours);

        if (memberTotalHours + dto.AssignedHours > 30)
            throw new Exception("Member cannot exceed 30 hours total per week.");

        // 2. Check category allocation limit
        var categoryAllocation = plan.Allocations.First(a => a.Category == backlogItem.Category);
        var categoryUsedHours = await _context.TaskAssignments
            .Include(a => a.BacklogItem)
            .Where(a => a.WeeklyPlanId == dto.WeeklyPlanId && a.BacklogItem.Category == backlogItem.Category)
            .SumAsync(a => a.AssignedHours);

        if (categoryUsedHours + dto.AssignedHours > categoryAllocation.AllocatedHours)
            throw new Exception($"Allocation for {backlogItem.Category} exceeded.");

        var assignment = _mapper.Map<TaskAssignment>(dto);
        assignment.Status = BacklogStatus.Planned;

        _context.TaskAssignments.Add(assignment);
        
        // Update backlog item status
        backlogItem.Status = BacklogStatus.Planned;
        
        await _context.SaveChangesAsync();
        
        // Re-fetch to include relations for DTO
        var result = await _context.TaskAssignments
            .Include(a => a.BacklogItem)
            .Include(a => a.User)
            .FirstAsync(a => a.Id == assignment.Id);
            
        return _mapper.Map<TaskAssignmentDto>(result);
    }

    public async Task<TaskAssignmentDto> UpdateProgressAsync(Guid id, int progressPercentage, Guid userId, string userRole)
    {
        var assignment = await _context.TaskAssignments
            .Include(a => a.BacklogItem)
            .Include(a => a.User)
            .Include(a => a.WeeklyPlan)
            .FirstOrDefaultAsync(a => a.Id == id);
            
        if (assignment == null) throw new Exception("Assignment not found");
        if (assignment.WeeklyPlan.IsFrozen) throw new Exception("Cannot update progress on a frozen plan.");

        if (userRole == Role.TeamMember.ToString() && assignment.UserId != userId)
            throw new Exception("Unauthorized to update this assignment.");

        assignment.ProgressPercentage = progressPercentage;
        assignment.Status = progressPercentage switch
        {
            100 => BacklogStatus.Completed,
            0 => BacklogStatus.Planned,
            _ => BacklogStatus.InProgress
        };

        // Sync with backlog item status
        assignment.BacklogItem.Status = assignment.Status;

        await _context.SaveChangesAsync();
        return _mapper.Map<TaskAssignmentDto>(assignment);
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid weeklyPlanId, DashboardFiltersDto filters)
    {
        var plan = await _context.WeeklyPlans.Include(p => p.Allocations).FirstOrDefaultAsync(p => p.Id == weeklyPlanId);
        if (plan == null) throw new Exception("Plan not found");

        var assignmentsQuery = _context.TaskAssignments
            .Include(a => a.BacklogItem)
            .Include(a => a.User)
            .Where(a => a.WeeklyPlanId == weeklyPlanId);

        if (filters.MemberId.HasValue) assignmentsQuery = assignmentsQuery.Where(a => a.UserId == filters.MemberId.Value);
        if (filters.Category.HasValue) assignmentsQuery = assignmentsQuery.Where(a => a.BacklogItem.Category == filters.Category.Value);
        if (filters.Status.HasValue) assignmentsQuery = assignmentsQuery.Where(a => a.Status == filters.Status.Value);

        var assignments = await assignmentsQuery.ToListAsync();
        var allPlanAssignments = await _context.TaskAssignments
            .Include(a => a.BacklogItem)
            .Where(a => a.WeeklyPlanId == weeklyPlanId)
            .ToListAsync();

        var summary = new DashboardSummaryDto
        {
            PlanSummary = new WeeklyPlanSummaryDto
            {
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                IsFrozen = plan.IsFrozen,
                TotalAvailable = plan.TotalAvailableHours,
                TotalPlanned = allPlanAssignments.Sum(a => a.AssignedHours)
            },
            CategoryUtilization = plan.Allocations.Select(alloc => new CategoryUtilizationDto
            {
                Category = alloc.Category,
                Allocated = alloc.AllocatedHours,
                Used = allPlanAssignments.Where(a => a.BacklogItem.Category == alloc.Category).Sum(a => a.AssignedHours),
                Percentage = alloc.AllocatedHours > 0 
                    ? (allPlanAssignments.Where(a => a.BacklogItem.Category == alloc.Category).Sum(a => a.AssignedHours) / alloc.AllocatedHours) * 100 
                    : 0
            }).ToList(),
            MemberProgress = assignments.GroupBy(a => a.User.Name).Select(g => new MemberProgressDto
            {
                Name = g.Key,
                Tasks = g.Count(),
                Completed = g.Count(a => a.Status == BacklogStatus.Completed),
                TotalHours = g.Sum(a => a.AssignedHours)
            }).ToList(),
            TaskLevelProgress = assignments.Select(a => new TaskLevelProgressDto
            {
                Id = a.Id,
                Title = a.BacklogItem.Title,
                MemberName = a.User.Name,
                Category = a.BacklogItem.Category,
                Status = a.Status,
                Progress = a.ProgressPercentage,
                Hours = a.AssignedHours
            }).ToList()
        };

        return summary;
    }
}
