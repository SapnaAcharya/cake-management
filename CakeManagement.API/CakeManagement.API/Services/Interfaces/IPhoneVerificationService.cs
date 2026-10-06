namespace CakeManagementAPI.DTOs.PhoneVerification
{
    public interface IPhoneVerificationService
    {
        Task SendOtpAsync(SendOtpDto dto);

        Task VerifyOtpAsync(VerifyOtpDto dto);
    }
}
