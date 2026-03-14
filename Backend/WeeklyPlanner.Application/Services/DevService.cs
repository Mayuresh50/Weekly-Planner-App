using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Application.Services;

public class DevService : IDevService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;

    public DevService(IApplicationDbContext context, IMapper mapper, IPasswordHasher passwordHasher)
    {
        _context = context;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task ResetDataAsync()
    {
        await _context.TaskAssignments.ExecuteDeleteAsync();
        await _context.PlanAllocations.ExecuteDeleteAsync();
        await _context.WeeklyPlans.ExecuteDeleteAsync();
        await _context.BacklogItems.ExecuteDeleteAsync();
        await _context.Users.ExecuteDeleteAsync();
    }

    public async Task SeedDataAsync()
    {
        await ResetDataAsync();

        // 1. Users
        var lead = new User { Id = Guid.NewGuid(), Name = "Manager Mayuresh", Email = "lead@example.com", Role = Role.TeamLead, PasswordHash = _passwordHasher.Hash("Admin123!") };
        var m1 = new User { Id = Guid.NewGuid(), Name = "Developer Alice", Email = "alice@example.com", Role = Role.TeamMember, PasswordHash = _passwordHasher.Hash("Alice123!") };
        var m2 = new User { Id = Guid.NewGuid(), Name = "Developer Bob", Email = "bob@example.com", Role = Role.TeamMember, PasswordHash = _passwordHasher.Hash("Bob123!") };
        var m3 = new User { Id = Guid.NewGuid(), Name = "Developer Charlie", Email = "charlie@example.com", Role = Role.TeamMember, PasswordHash = _passwordHasher.Hash("Charlie123!") };
        
        _context.Users.AddRange(lead, m1, m2, m3);

        // 2. Weekly Plan
        var now = DateTime.UtcNow.Date;
        var start = now.AddDays(-(int)now.DayOfWeek + 1); // Monday
        var end = start.AddDays(6); // Sunday
        
        var memberCount = 3;
        var totalCapacity = memberCount * 30;

        var plan = new WeeklyPlan
        {
            Id = Guid.NewGuid(),
            StartDate = start,
            EndDate = end,
            ClientPercentage = 40,
            TechDebtPercentage = 30,
            RndPercentage = 30,
            TotalAvailableHours = totalCapacity,
            IsFrozen = false
        };
        _context.WeeklyPlans.Add(plan);

        // 3. Allocations
        var allocations = new List<PlanAllocation>
        {
            new() { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, Category = Category.Client, AllocatedHours = totalCapacity * 0.4m },
            new() { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, Category = Category.TechDebt, AllocatedHours = totalCapacity * 0.3m },
            new() { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, Category = Category.RnD, AllocatedHours = totalCapacity * 0.3m }
        };
        _context.PlanAllocations.AddRange(allocations);

        // 4. Backlog Items
        var bi1 = new BacklogItem { Id = Guid.NewGuid(), Title = "Frontend Redesign", Category = Category.Client, EstimatedHours = 12, Status = BacklogStatus.Backlog };
        var bi2 = new BacklogItem { Id = Guid.NewGuid(), Title = "Fix Auth Bug", Category = Category.TechDebt, EstimatedHours = 8, Status = BacklogStatus.Backlog };
        var bi3 = new BacklogItem { Id = Guid.NewGuid(), Title = "Research AI Integration", Category = Category.RnD, EstimatedHours = 15, Status = BacklogStatus.Backlog };
        var bi4 = new BacklogItem { Id = Guid.NewGuid(), Title = "Database Migration", Category = Category.TechDebt, EstimatedHours = 10, Status = BacklogStatus.Backlog };
        var bi5 = new BacklogItem { Id = Guid.NewGuid(), Title = "Client Feedback Loop", Category = Category.Client, EstimatedHours = 6, Status = BacklogStatus.Backlog };
        
        _context.BacklogItems.AddRange(bi1, bi2, bi3, bi4, bi5);

        // 5. Assignments (3 assignments)
        var a1 = new TaskAssignment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, UserId = m1.Id, BacklogItemId = bi1.Id, AssignedHours = 12, Status = BacklogStatus.Planned, ProgressPercentage = 0 };
        var a2 = new TaskAssignment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, UserId = m2.Id, BacklogItemId = bi2.Id, AssignedHours = 8, Status = BacklogStatus.Planned, ProgressPercentage = 0 };
        var a3 = new TaskAssignment { Id = Guid.NewGuid(), WeeklyPlanId = plan.Id, UserId = m3.Id, BacklogItemId = bi3.Id, AssignedHours = 15, Status = BacklogStatus.Planned, ProgressPercentage = 0 };
        
        _context.TaskAssignments.AddRange(a1, a2, a3);
        
        bi1.Status = BacklogStatus.Planned;
        bi2.Status = BacklogStatus.Planned;
        bi3.Status = BacklogStatus.Planned;

        await _context.SaveChangesAsync();
    }

    public async Task<ExportDataDto> ExportDataAsync()
    {
        var users = await _context.Users.ToListAsync();
        var plans = await _context.WeeklyPlans.ToListAsync();
        var backlog = await _context.BacklogItems.ToListAsync();
        var assignments = await _context.TaskAssignments.ToListAsync();

        return new ExportDataDto
        {
            Users = _mapper.Map<List<UserDto>>(users),
            WeeklyPlans = _mapper.Map<List<WeeklyPlanDto>>(plans),
            BacklogItems = _mapper.Map<List<BacklogItemDto>>(backlog),
            Assignments = _mapper.Map<List<TaskAssignmentDto>>(assignments)
        };
    }

    public async Task ImportDataAsync(ExportDataDto data)
    {
        await ResetDataAsync();

        // 1. Users (Need to handle password hashes if not in DTO, but for import we assuming valid data)
        // Note: UserDto doesn't have password hash. For import/export, we might need a more complete DTO or use Domain directly.
        // For simplicity, we'll map back what we have.
        
        var users = data.Users.Select(u => new User
        {
            Id = u.Id,
            Email = u.Email,
            Name = u.Name,
            Role = u.Role,
            PasswordHash = _passwordHasher.Hash("Default123!") // Default password for imported users
        }).ToList();
        _context.Users.AddRange(users);

        var plans = _mapper.Map<List<WeeklyPlan>>(data.WeeklyPlans);
        _context.WeeklyPlans.AddRange(plans);

        // Allocations are separate entities in PostgreSQL.
        // We need to re-generate or include in export.
        // Let's assume export includes them in PlanDto and we re-separate.
        foreach(var planDto in data.WeeklyPlans)
        {
            var allocations = planDto.Allocations.Select(a => new PlanAllocation
            {
                Id = Guid.NewGuid(),
                WeeklyPlanId = planDto.Id,
                Category = a.Category,
                AllocatedHours = a.AllocatedHours
            }).ToList();
            _context.PlanAllocations.AddRange(allocations);
        }

        var items = _mapper.Map<List<BacklogItem>>(data.BacklogItems);
        _context.BacklogItems.AddRange(items);

        var assignments = _mapper.Map<List<TaskAssignment>>(data.Assignments);
        _context.TaskAssignments.AddRange(assignments);

        await _context.SaveChangesAsync();
    }
}
