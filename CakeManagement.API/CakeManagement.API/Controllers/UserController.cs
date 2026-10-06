using CakeManagementAPI.DTOs.User;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // GET PROFILE
        // GET: api/User/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserIdFromToken();

            if (userId == null)
            {
                return Unauthorized("Invalid user token.");
            }

            var user = await _userService
                .GetProfileAsync(userId.Value);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }

        // UPDATE PROFILE
        // PUT: api/User/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
            UpdateProfileDto dto)
        {
            var userId = GetUserIdFromToken();

            if (userId == null)
            {
                return Unauthorized("Invalid user token.");
            }

            var user = await _userService
                .UpdateProfileAsync(
                    userId.Value,
                    dto);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                message = "Profile updated successfully.",
                user
            });
        }

        // Change password
        //  Put: api/User/change-password
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(
            ChangePasswordDto dto)
        {
            var userId = GetUserIdFromToken();

            if (userId == null)
            {
                return Unauthorized("Invalid user token.");
            }

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            {
                return BadRequest("New password must be at least 6 characters.");
            }

            var result = await _userService
                .ChangePasswordAsync(
                    userId.Value, dto);

            return result switch
            {
                ChangePasswordResult.UserNotFound => NotFound("User not found."),
                ChangePasswordResult.IncorrectCurrentPassword => BadRequest("Current password is incorrect."),
                _ => Ok(new { message = "Password changed successfully." })
            };
        }

        // GET: api/User/orders
        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders()
        {
            var userId = GetUserIdFromToken();

            if (userId == null)
            {
                return Unauthorized("Invalid user token.");
            }

            var orders = await _userService
                .GetOrdersAsync(userId.Value);

            return Ok(orders);
        }

        // GET USER ID FROM JWT
        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                return null;
            }

            if (!int.TryParse(
                    userIdClaim,
                    out int userId))
            {
                return null;
            }

            return userId;
        }
    }
}