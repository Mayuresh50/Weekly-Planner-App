using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Infrastructure.Auth;
using WeeklyPlanner.Infrastructure.Persistence;

namespace WeeklyPlanner.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseCosmos(
                configuration["Cosmos:Endpoint"] ?? "",
                configuration["Cosmos:Key"] ?? "",
                configuration["Cosmos:DatabaseName"] ?? "WeeklyPlanner"));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        
        services.AddScoped<IJwtProvider, JwtProvider>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        return services;
    }
}
