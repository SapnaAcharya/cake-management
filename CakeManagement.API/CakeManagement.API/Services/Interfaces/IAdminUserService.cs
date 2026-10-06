using CakeManagementAPI.DTOs.AdminUser;

namespace CakeManagementAPI.DTOs
{
    public interface IAdminUserService
    {
        Task<List<AdminUserDto>> GetAllUsersAsync();

        Task<AdminUserDto?> GetUserByIdAsync(int id);

        Task<AdminUserDto?> UpdateUserAsync(int id, UpdateuserDto dto);

        Task<bool> DeleteUserAsync(int id);
    }
}
