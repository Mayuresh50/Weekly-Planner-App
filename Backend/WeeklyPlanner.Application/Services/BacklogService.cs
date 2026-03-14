using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.Application.Services;

public class BacklogService : IBacklogService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public BacklogService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<BacklogItemDto> CreateItemAsync(CreateBacklogItemDto dto)
    {
        var item = _mapper.Map<BacklogItem>(dto);
        _context.BacklogItems.Add(item);
        await _context.SaveChangesAsync();
        return _mapper.Map<BacklogItemDto>(item);
    }

    public async Task<IEnumerable<BacklogItemDto>> GetAllItemsAsync()
    {
        var items = await _context.BacklogItems
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
        return _mapper.Map<IEnumerable<BacklogItemDto>>(items);
    }

    public async Task<BacklogItemDto?> GetItemAsync(Guid id)
    {
        var item = await _context.BacklogItems.FindAsync(id);
        return item == null ? null : _mapper.Map<BacklogItemDto>(item);
    }

    public async Task<BacklogItemDto> UpdateItemAsync(Guid id, UpdateBacklogItemDto dto)
    {
        var item = await _context.BacklogItems.FindAsync(id);
        if (item == null) throw new Exception("Backlog item not found");

        if (dto.Title != null) item.Title = dto.Title;
        if (dto.Description != null) item.Description = dto.Description;
        if (dto.Category.HasValue) item.Category = dto.Category.Value;
        if (dto.EstimatedHours.HasValue) item.EstimatedHours = dto.EstimatedHours.Value;
        if (dto.Status.HasValue) item.Status = dto.Status.Value;

        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<BacklogItemDto>(item);
    }

    public async Task DeleteItemAsync(Guid id)
    {
        var item = await _context.BacklogItems.FindAsync(id);
        if (item != null)
        {
            _context.BacklogItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}
