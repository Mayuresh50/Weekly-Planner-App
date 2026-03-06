using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.Application.Common.Interfaces;
using WeeklyPlanner.Application.DTOs;
using WeeklyPlanner.Domain.Entities;
using WeeklyPlanner.Domain.Enums;

namespace WeeklyPlanner.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IJwtProvider _jwtProvider;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IApplicationDbContext context, IMapper mapper, IJwtProvider jwtProvider, IPasswordHasher passwordHasher)
    {
        _context = context;
        _mapper = mapper;
        _jwtProvider = jwtProvider;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var users = await _context.Users.ToListAsync();
        var user = users.FirstOrDefault(u => u.Email == dto.Email);
        
        if (user == null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new Exception("Invalid email or password.");

        return new AuthResponseDto
        {
            Token = _jwtProvider.Generate(user),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var users = await _context.Users.ToListAsync();
        if (users.Any(u => u.Email == dto.Email))
            throw new Exception("Email already registered.");

        var user = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            Role = dto.Role,
            PasswordHash = _passwordHasher.Hash(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = _jwtProvider.Generate(user),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<IEnumerable<UserDto>> GetTeamMembersAsync()
    {
        var users = await _context.Users
            .Where(u => u.Role == Role.TeamMember)
            .ToListAsync();

        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        // Remove user's assignments first to maintain referential integrity if not handled by cascade
        var assignments = await _context.TaskAssignments.Where(a => a.UserId == id).ToListAsync();
        _context.TaskAssignments.RemoveRange(assignments);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}
