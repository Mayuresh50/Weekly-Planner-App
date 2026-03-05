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
        await _context.BeginTransactionAsync();
        try
        {
            // 1. Auto-retrieve the ACTIVE WeeklyPlan
            var now = DateTime.UtcNow;
            var plan = await _context.WeeklyPlans
                .Include(p => p.Allocations)
                .FirstOrDefaultAsync(p => p.StartDate <= now && p.EndDate >= now);

            if (plan == null) 
                throw new BusinessException("No active weekly plan found for the current date.");
            
            if (plan.IsFrozen) 
                throw new BusinessException("The current weekly plan is frozen and cannot be modified.");

            // 2. Validate User existence and role (ONLY TeamMember)
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) 
                throw new BusinessException("The assigned user does not exist.");
            
            if (user.Role != Role.TeamMember)
                throw new BusinessException("Assignments can ONLY be given to team members. Team leads cannot receive assignments.");

            // 3. Validate backlog item existence and status
            var backlogItem = await _context.BacklogItems.FindAsync(dto.BacklogItemId);
            if (backlogItem == null) 
                throw new BusinessException("The selected backlog item was not found.");
            
            if (backlogItem.Status != BacklogStatus.Backlog)
                throw new BusinessException("Only items currently in the 'Backlog' can be assigned.");

            // 4. Check aggregate member capacity limit (30h) - SQLite compatible Sum
            var existingAssignments = await _context.TaskAssignments
                .Where(a => a.WeeklyPlanId == plan.Id && a.UserId == user.Id)
                .Select(a => a.AssignedHours)
                .ToListAsync();

            var currentAssignedTotal = existingAssignments.Sum();

            if (currentAssignedTotal + dto.AssignedHours > 30)
                throw new BusinessException($"Member {user.Name} cannot exceed 30 hours per week. (Current: {currentAssignedTotal}h, Selected: {dto.AssignedHours}h)");

            // 5. Check category allocation limit
            var categoryAllocation = plan.Allocations.FirstOrDefault(a => a.Category == backlogItem.Category);
            if (categoryAllocation == null) 
                throw new BusinessException($"No allocation found for category {backlogItem.Category}");

            var categoryUsedAssignments = await _context.TaskAssignments
                .Include(a => a.BacklogItem)
                .Where(a => a.WeeklyPlanId == plan.Id && a.BacklogItem.Category == backlogItem.Category)
                .Select(a => a.AssignedHours)
                .ToListAsync();

            var categoryUsedHours = categoryUsedAssignments.Sum();

            if (categoryUsedHours + dto.AssignedHours > categoryAllocation.AllocatedHours)
                throw new BusinessException($"Category '{backlogItem.Category}' allocation exceeded. (Current: {categoryUsedHours}h, Selected: {dto.AssignedHours}h, Max Allowed: {categoryAllocation.AllocatedHours}h). Please increase this category's percentage in the Weekly Plan setup.");

            // 6. Create TaskAssignment safely
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
            
            // Update backlog item status
            backlogItem.Status = BacklogStatus.Planned;
            
            await _context.SaveChangesAsync();
            await _context.CommitTransactionAsync();
            
            // Re-fetch to include relations for DTO
            var result = await _context.TaskAssignments
                .Include(a => a.BacklogItem)
                .Include(a => a.User)
                .FirstAsync(a => a.Id == assignment.Id);
                
            return _mapper.Map<TaskAssignmentDto>(result);
        }
        catch
        {
            await _context.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<TaskAssignmentDto> UpdateProgressAsync(Guid id, UpdateProgressDto dto, Guid userId, string userRole)
    {
        var assignment = await _context.TaskAssignments
            .Include(a => a.BacklogItem)
            .Include(a => a.User)
            .Include(a => a.WeeklyPlan)
            .FirstOrDefaultAsync(a => a.Id == id);
            
        if (assignment == null) 
            throw new BusinessException("Assignment not found.");

        if (assignment.WeeklyPlan.IsFrozen) 
            throw new BusinessException("Cannot update progress on a frozen weekly plan.");

        // Member can only update their own tasks. Lead can update anything.
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

        // Sync with backlog item status
        assignment.BacklogItem.Status = assignment.Status;

        await _context.SaveChangesAsync();
        return _mapper.Map<TaskAssignmentDto>(assignment);
    }

    public async Task<DashboardSummaryDto> GetActiveDashboardSummaryAsync(DashboardFiltersDto filters)
    {
        var now = DateTime.UtcNow;
        var plan = await _context.WeeklyPlans
            .FirstOrDefaultAsync(p => p.StartDate <= now && p.EndDate >= now);

        if (plan == null)
        {
            // Try to get the latest one if no active one right now
            plan = await _context.WeeklyPlans.OrderByDescending(p => p.StartDate).FirstOrDefaultAsync();
        }

        if (plan == null) return new DashboardSummaryDto();

        return await GetDashboardSummaryAsync(plan.Id, filters);
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
                TotalPlanned = allPlanAssignments.Sum(a => a.AssignedHours) // Memory
            },
            CategoryUtilization = plan.Allocations.Select(alloc => 
            {
                var used = allPlanAssignments
                    .Where(a => a.BacklogItem.Category == alloc.Category)
                    .Sum(a => a.AssignedHours); // Memory
                
                return new CategoryUtilizationDto
                {
                    Category = alloc.Category,
                    Allocated = alloc.AllocatedHours,
                    Used = used,
                    Percentage = alloc.AllocatedHours > 0 ? (used / alloc.AllocatedHours) * 100 : 0
                };
            }).ToList(),
            MemberProgress = assignments
                .GroupBy(a => new { a.UserId, a.User.Name })
                .Select(g => new MemberProgressDto
                {
                    Name = g.Key.Name,
                    Tasks = g.Count(),
                    Completed = g.Count(a => a.Status == BacklogStatus.Completed),
                    TotalHours = g.Sum(a => a.AssignedHours) // Memory
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
