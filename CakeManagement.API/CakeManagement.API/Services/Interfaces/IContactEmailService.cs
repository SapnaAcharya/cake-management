namespace CakeManagementAPI.Services.Interfaces
{
    public interface IContactEmailService
    {
        Task SendContactMessageAsync(
            string name,
            string email,
            string subject,
            string message);
    }
}
