using AutoMapper;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<BacklogItem, BacklogItemDto>();
        CreateMap<WeeklyPlan, WeeklyPlanDto>()
            .ForMember(d => d.Allocations, opt => opt.MapFrom(s => s.Allocations));
        CreateMap<PlanAllocation, PlanAllocationDto>();
        CreateMap<TaskAssignment, TaskAssignmentDto>()
            .ForMember(d => d.BacklogItemTitle, opt => opt.MapFrom(s => s.BacklogItem.Title))
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User.Name));
            
        CreateMap<CreateBacklogItemDto, BacklogItem>();
        CreateMap<CreateWeeklyPlanDto, WeeklyPlan>();
        CreateMap<CreateAssignmentDto, TaskAssignment>();
    }
}
