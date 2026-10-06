using CakeManagementAPI.DTOs.User;
using CakeManagementAPI.Models;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);

        Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);

        Task<ChangePasswordResult> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<List<UserOrderDto>> GetOrdersAsync(int userId);
    }
}
