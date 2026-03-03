using WeeklyPlanner.Domain.Common;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Domain.Entities;

public class BacklogItem : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Category Category { get; set; }
    public decimal EstimatedHours { get; set; }
    public BacklogStatus Status { get; set; } = BacklogStatus.Backlog;

    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
}
