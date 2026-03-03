using WeeklyPlanner.Domain.Entities;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IJwtProvider
{
    string Generate(User user);
}
