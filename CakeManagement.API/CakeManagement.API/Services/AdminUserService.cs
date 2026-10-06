using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.AdminOrder;
using CakeManagementAPI.DTOs.AdminUser;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _context;

        public AdminUserService(AppDbContext context)
        {
            _context = context;
        }

        // Get all users
        public async Task<List<AdminUserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .AsNoTracking()
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        // Get user by id
        public async Task<AdminUserDto?> GetUserByIdAsync(
            int id)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == id)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        // Update user
        public async Task<AdminUserDto?> UpdateUserAsync(int id, UpdateuserDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return null;
            }

            user.Name = dto.Name.Trim();
            user.Phone = dto.Phone?.Trim();
            user.Address = dto.Address?.Trim();
            user.Role = dto.Role.Trim();

            await _context.SaveChangesAsync();

            return new AdminUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        // Delete user
        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}