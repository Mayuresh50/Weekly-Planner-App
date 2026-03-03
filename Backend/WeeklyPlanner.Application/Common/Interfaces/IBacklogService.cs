using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IBacklogService
{
    Task<BacklogItemDto> CreateItemAsync(CreateBacklogItemDto dto);
    Task<IEnumerable<BacklogItemDto>> GetAllItemsAsync();
    Task<BacklogItemDto?> GetItemAsync(Guid id);
    Task<BacklogItemDto> UpdateItemAsync(Guid id, UpdateBacklogItemDto dto);
    Task DeleteItemAsync(Guid id);
}
