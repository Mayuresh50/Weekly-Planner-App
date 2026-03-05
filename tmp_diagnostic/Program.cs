using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

public class WeeklyPlan
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsFrozen { get; set; }
}

public class AppDbContext : DbContext
{
    public DbSet<WeeklyPlan> WeeklyPlans { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=Backend/WeeklyPlanner.API/WeeklyPlanner.db");
}

class Program
{
    static void Main()
    {
        using var db = new AppDbContext();
        var plans = db.WeeklyPlans.ToList();
        Console.WriteLine("\n--- Weekly Plans ---");
        foreach (var p in plans)
        {
            Console.WriteLine($"ID: {p.Id} | Start: {p.StartDate:O} | End: {p.EndDate:O} | Frozen: {p.IsFrozen}");
        }
    }
}
