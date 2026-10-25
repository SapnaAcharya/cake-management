using CakeManagement.DTOs.Auth;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Auth;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task RegisterAsync(RegisterDto dto);
        Task<LoginResponseDto> LoginAsync(
            LoginDto dto);

        Task<LoginResponseDto> GoogleLoginAsync(GoogleLoginDto dto);

        Task LinkGoogleAccountAsync(int userId, GoogleLoginDto dto);
        Task ForgotPasswordAsync(ForgotPasswordDto dto);

        Task ResetPasswordAsync(ResetPasswordDto dto);

        Task VerifyEmailOtpAsync(VerifyEmailOtpDto dto);

        Task ResendEmailOtpAsync(ResendEmailOtpDto dto);
    }
}
