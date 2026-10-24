using CakeManagement.DTOs.Auth;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Auth;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> RegisterAsync(
            RegisterDto dto);

        Task<LoginResponseDto> LoginAsync(
            LoginDto dto);

        Task ForgotPasswordAsync(ForgotPasswordDto dto);

        Task ResetPasswordAsync(ResetPasswordDto dto);
    }
}
