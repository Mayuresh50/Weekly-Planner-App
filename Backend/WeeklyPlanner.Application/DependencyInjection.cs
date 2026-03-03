using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.Services;

namespace WeeklyPlanner.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped<IBacklogService, BacklogService>();
        services.AddScoped<IWeeklyPlanService, WeeklyPlanService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
