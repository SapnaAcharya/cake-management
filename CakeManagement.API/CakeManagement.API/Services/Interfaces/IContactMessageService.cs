
using CakeManagementAPI.DTOs.Contact;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IContactMessageService
    {
        Task<ContactMessageResponseDto> CreateMessageAsync(
            ContactMessageDto dto);

        Task<List<ContactMessageResponseDto>> GetAllMessagesAsync();

        Task<ContactMessageResponseDto?> GetMessageByIdAsync(int id);

        Task<bool> UpdateMessageStatusAsync(
            int id,
            UpdateContactMessageStatusDto dto);

        Task<bool> SendAdminReplyAsync(int id, string replyMessage);

        Task<bool> DeleteMessageAsync(int id);
    }
}
