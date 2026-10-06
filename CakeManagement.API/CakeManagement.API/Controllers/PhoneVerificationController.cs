using CakeManagementAPI.DTOs.PhoneVerification;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class PhoneVerificationController
        : ControllerBase
    {
        private readonly IPhoneVerificationService
            _phoneVerificationService;

        public PhoneVerificationController(
            IPhoneVerificationService phoneVerificationService)
        {
            _phoneVerificationService =
                phoneVerificationService;
        }

        // SEND OTP
        [HttpPost("send")]
        public async Task<IActionResult> SendOtp(
            [FromBody] SendOtpDto dto)
        {
            try
            {
                await _phoneVerificationService
                    .SendOtpAsync(dto);

                return Ok(new
                {
                    message =
                        "OTP sent successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return BadRequest(new
                {
                    message = "something wen wrong."
                });
            }
        }

        // VERIFY OTP
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOtp(
            [FromBody] VerifyOtpDto dto)
        {
            try
            {
                await _phoneVerificationService
                    .VerifyOtpAsync(dto);

                return Ok(new
                {
                    verified = true,
                    message =
                        "Phone number verified successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    verified = false,
                    message = ex.Message
                });
            }
        }
    }
}