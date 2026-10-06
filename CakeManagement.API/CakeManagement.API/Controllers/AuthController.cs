using CakeManagement.DTOs.Auth;
using CakeManagementAPI.DTOs.Auth;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Services.Interfaces
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // Register
        // Post: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> register(
            RegisterDto dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // Login
        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
                });
            }
        }
    }
}
