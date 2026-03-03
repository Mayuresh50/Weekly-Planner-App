using WeeklyPlanner.Domain.Common;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.TeamMember;

    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
}
