using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;
using WeeklyPlanner.Infrastructure.Persistence;
using WeeklyPlanner.Application.Common.Interfaces;

namespace WeeklyPlanner.API;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        // Ensure database exists
        context.Database.EnsureCreated();

        var userCount = await context.Users.CountAsync();
        if (userCount == 0)
        {
            var lead = new User
            {
                Email = "lead@test.com",
                PasswordHash = passwordHasher.Hash("password123"),
                Name = "Team Lead",
                Role = Role.TeamLead
            };

            var member = new User
            {
                Email = "member@test.com",
                PasswordHash = passwordHasher.Hash("password123"),
                Name = "John Member",
                Role = Role.TeamMember
            };

            context.Users.AddRange(lead, member);
            await context.SaveChangesAsync();
        }
    }
}
