using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Diagnostic;

public class Program
{
    public static async Task Main(string[] args)
    {
        var services = new ServiceCollection();
        services.AddDbContext<ApplicationDbContext>(options =>
            // Adjust path if needed
            options.UseSqlite("Data Source=Backend/WeeklyPlanner.API/WeeklyPlanner.db"));

        var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        Console.WriteLine("\n--- Weekly Plans ---");
        var plans = await context.WeeklyPlans.ToListAsync();
        foreach (var p in plans)
        {
            Console.WriteLine($"ID: {p.Id} | Start: {p.StartDate:O} | End: {p.EndDate:O} | Frozen: {p.IsFrozen}");
        }
    }
}
