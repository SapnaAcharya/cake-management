using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.User;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace CakeManagementAPI.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IImageService _imageService;
        private readonly PasswordHasher<User> _passwordHasher;

        public UserService(AppDbContext context, IImageService imageService)
        {
            _context = context;
            _imageService = imageService;
            _passwordHasher = new PasswordHasher<User>();
        }

        private static UserProfileDto ToProfileDto(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                ProfileImageUrl = user.ProfileImageUrl
            };
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

            return ToProfileDto(user);
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

            return ToProfileDto(user);
        }

        //public async Task<string?> UploadProfileImageAsync(int userId, IFormFile file)
        //{
        //    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        //    if (user == null) return null;

        //    var url = await _imageService.UploadAsync(file, "profile-photos");

        //    user.ProfileImageUrl = url;
        //    await _context.SaveChangesAsync();

        //    return url;
        //}

        //public async Task<bool> RemoveProfileImageAsync(int userId)
        //{
        //    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        //    if (user == null) return false;

        //    user.ProfileImageUrl = null;
        //    await _context.SaveChangesAsync();

        //    return true;
        //}

        public async Task<string?> UploadProfileImageAsync(int userId, IFormFile file)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            var url = await _imageService.UploadProfilePhotoAsync(file, userId);

            user.ProfileImageUrl = url;
            await _context.SaveChangesAsync();

            return url;
        }

        public async Task<bool> RemoveProfileImageAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;

            try
            {
                await _imageService.DeleteProfilePhotoAsync(userId);
            }
            catch
            {
                // Don't block the user if Cloudinary cleanup fails
            }

            user.ProfileImageUrl = null;
            await _context.SaveChangesAsync();

            return true;
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
        public async Task<List<UserOrderDto>> GetOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Cake)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.CakeTemplate)
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

                Items = order.OrderItems.Select(item => new UserOrderItemDto
                {
                    CakeId = item.CakeId,

                    CakeName = item.Cake?.Name
                               ?? item.CakeTemplate?.Name
                               ?? "Custom Cake",

                    ImageUrl = item.Cake?.ImageUrl ?? string.Empty,

                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.Subtotal
                }).ToList()
            }).ToList();
        }
    }
}