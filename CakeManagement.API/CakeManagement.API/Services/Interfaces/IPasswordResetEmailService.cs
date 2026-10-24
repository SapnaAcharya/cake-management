namespace CakeManagementAPI.Services.Interfaces
{
    public interface IPasswordResetEmailService
    {
        Task SendPasswordResetEmailAsync(
            string email,
            string resetUrl);
    }
}
