using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.AdminUser;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminUserController : ControllerBase
    {
        private readonly IAdminUserService _adminUserService;

        public AdminUserController(IAdminUserService adminUserService)
        {
            _adminUserService = adminUserService;
        }

        // get: api/AdminUser/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminUserService
                .GetAllUsersAsync();

            return Ok(users);
        }

        // Get: api/AdminUser/users/{id}
        [HttpGet("users/{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _adminUserService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }

        // Put: api/AdminUser/users/{id}
        [HttpPut("users/{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateuserDto dto)
        {
            var user = await _adminUserService.UpdateUserAsync(id, dto);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                message = "User updated successfully.",
                user
            });
        }

        // Delete : api/AdminUser/users/{id}
        [HttpDelete("users/{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var deleted = await _adminUserService
                .DeleteUserAsync(id);

            if (!deleted)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                message = "User deleted successfully."
            });
        }
    }
}