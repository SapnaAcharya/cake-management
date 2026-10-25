using CakeManagement.DTOs.Auth;
using CakeManagementAPI.DTOs.Auth;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

      // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterDto dto)
        {
            try
            {
                await _authService.RegisterAsync(dto);

                return Ok(new
                {
                    message = "Account created. Please check your email for the verification code.",
                    email = dto.Email.Trim().ToLowerInvariant()
                });
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

        // Googgle signin
        // Post: /api/auth/google
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin(
            [FromBody] GoogleLoginDto dto)
        {
            try
            {
                var result = await _authService.GoogleLoginAsync(dto);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // POST: api/Auth/link-google
        [Authorize(Roles = "Customer")]
        [HttpPost("link-google")]
        public async Task<IActionResult> LinkGoogleAccount(
            [FromBody] GoogleLoginDto dto)
        {
            var userIdValue = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdValue, out var userId))
            {
                return Unauthorized(new
                {
                    message = "Please sign in again."
                });
            }

            try
            {
                await _authService.LinkGoogleAccountAsync(userId, dto);

                return Ok(new
                {
                    message = "Google account linked successfully."
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // POST: api/Auth/forgot-password
        [HttpPost("forgot-password")]
        [EnableRateLimiting("forgot")]
        public async Task<IActionResult> ForgotPassword(
            ForgotPasswordDto dto)
        {
             _logger.LogInformation(
            "ForgotPassword called. Email: [{Email}], Origin: {Origin}",
            dto.Email, Request.Headers["Origin"].ToString());
            try
            {
                await _authService.ForgotPasswordAsync(dto);

                // Same response whether or not the email exists.
                return Ok(new
                {
                    message = "If an account exists with that email, " +
                              "a password reset link will be sent."
                });
            }
            catch (Exception ex)
            {
                 // Without this line, the real error is hidden from you
            _logger.LogError(ex, "ForgotPassword failed for {Email}", dto.Email);
                // Do not expose internal email-service or server details.
                return StatusCode(500, new
                {
                    message = "We couldn't process your request right now. " +
                              "Please try again later."
                });
            }
        }

        // POST: api/Auth/reset-password
        [HttpPost("reset-password")]
        [EnableRateLimiting("reset")]
        public async Task<IActionResult> ResetPassword(
            ResetPasswordDto dto)
        {
            try
            {
                await _authService.ResetPasswordAsync(dto);

                return Ok(new
                {
                    message = "Your password has been reset successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // POST: api/Auth/verify-email
        [HttpPost("verify-email")]
        [EnableRateLimiting("reset")]
        public async Task<IActionResult> VerifyEmail(
            [FromBody] VerifyEmailOtpDto dto)
        {
            try
            {
                await _authService.VerifyEmailOtpAsync(dto);

                return Ok(new
                {
                    message = "Email verified successfully. You can now sign in."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // POST: api/Auth/resend-email-otp
        [HttpPost("resend-email-otp")]
        [EnableRateLimiting("forgot")]
        public async Task<IActionResult> ResendEmailOtp(
            [FromBody] ResendEmailOtpDto dto)
        {
            try
            {
                await _authService.ResendEmailOtpAsync(dto);

                return Ok(new
                {
                    message = "If an unverified account exists for that email, a verification code will be sent."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

    }
}
