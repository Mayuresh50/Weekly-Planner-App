using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<IEnumerable<UserDto>> GetTeamMembersAsync();
    Task<bool> DeleteUserAsync(Guid id);
}
