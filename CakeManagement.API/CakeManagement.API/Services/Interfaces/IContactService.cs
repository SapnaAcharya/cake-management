
using CakeManagementAPI.DTOs.Contact;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IContactService
    {
        // Public contact page
        Task<ContactSettingsDto> GetContactSettingsAsync();

        // Admin contact settings
        Task UpdateContactSettingsAsync(UpdateContactSettingsDto dto);

        // FAQ management
        Task<List<ContactFaqDto>> GetFaqsAsync();

        Task<ContactFaqDto> CreateFaqAsync(CreateContactFaqDto dto);

        Task<ContactFaqDto?> UpdateFaqAsync(
            int id,
            CreateContactFaqDto dto);

        Task<bool> DeleteFaqAsync(int id);
    }
}
