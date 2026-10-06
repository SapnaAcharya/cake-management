using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.User;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.AspNetCore.Identity;

namespace CakeManagementAPI.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;

        public UserService(AppDbContext context)
        {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();
        }

        // Get profile
        public async Task<UserProfileDto?> GetProfileAsync(
            int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return null;
            }

            return new UserProfileDto
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

        // Update profile
        public async Task<UserProfileDto?> UpdateProfileAsync(
            int userId, UpdateProfileDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return null;
            }

            user.Name = dto.Name.Trim();
            user.Phone = dto.Phone?.Trim();
            user.Address = dto.Address?.Trim();

            await _context.SaveChangesAsync();

            return new UserProfileDto
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

        // change password
        public async Task<ChangePasswordResult> ChangePasswordAsync(
            int userId, ChangePasswordDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ChangePasswordResult.UserNotFound;
            }

            var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);

            if (verifyResult == PasswordVerificationResult.Failed)
                return ChangePasswordResult.IncorrectCurrentPassword;

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);

            await _context.SaveChangesAsync();

            return ChangePasswordResult.Success;
        }

        // Get user orders
        public async Task<List<UserOrderDto>> GetOrdersAsync (
            int userId)
        {
            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                 .ThenInclude(oi => oi.Cake)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(order => new UserOrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,

                Items = order.OrderItems.Select(item =>
                    new UserOrderItemDto
                    {
                        CakeId = item.CakeId,

                        CakeName = item.Cake != null
                           ? item.Cake.Name
                           : string.Empty,

                        ImageUrl = item.Cake != null
                           ? item.Cake.ImageUrl
                           : string.Empty,

                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        Subtotal = item.Subtotal
                    })
                .ToList()
            }).ToList();

        }
    }
}