using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Application.DTOs;

public class BacklogItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Category Category { get; set; }
    public decimal EstimatedHours { get; set; }
    public BacklogStatus Status { get; set; }
}

public class CreateBacklogItemDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Category Category { get; set; }
    public decimal EstimatedHours { get; set; }
}

public class UpdateBacklogItemDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Category? Category { get; set; }
    public decimal? EstimatedHours { get; set; }
    public BacklogStatus? Status { get; set; }
}
