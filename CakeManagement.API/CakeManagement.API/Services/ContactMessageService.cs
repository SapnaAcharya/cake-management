
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Contact;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class ContactMessageService : IContactMessageService
    {
        private readonly AppDbContext _context;

        public ContactMessageService(AppDbContext context)
        {
            _context = context;
        }

        // Save a customer enquiry
        public async Task<ContactMessageResponseDto> CreateMessageAsync(
            ContactMessageDto dto)
        {
            var contactMessage = new ContactMessage
            {
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim(),
                Subject = dto.Subject.Trim(),
                Message = dto.Message.Trim(),
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactMessages.Add(contactMessage);

            await _context.SaveChangesAsync();

            return MapToDto(contactMessage);
        }

        // Get all customer enquiries
        public async Task<List<ContactMessageResponseDto>> GetAllMessagesAsync()
        {
            var messages = await _context.ContactMessages
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return messages.Select(MapToDto).ToList();
        }

        // Get a single enquiry
        public async Task<ContactMessageResponseDto?> GetMessageByIdAsync(
            int id)
        {
            var message = await _context.ContactMessages
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            return message == null ? null : MapToDto(message);
        }

        // Update enquiry status
        public async Task<bool> UpdateMessageStatusAsync(
            int id,
            UpdateContactMessageStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
            {
                throw new ArgumentException(
                    "Message status is required.");
            }

            var message = await _context.ContactMessages
                .FirstOrDefaultAsync(x => x.Id == id);

            if (message == null)
            {
                return false;
            }

            var status = dto.Status.Trim();

            var allowedStatuses = new[]
            {
                "Pending",
                "Read",
                "Replied"
            };

            var validStatus = allowedStatuses.FirstOrDefault(
                x => x.Equals(
                    status,
                    StringComparison.OrdinalIgnoreCase));

            if (validStatus == null)
            {
                throw new ArgumentException(
                    "Status must be Pending, Read, or Replied.");
            }

            message.Status = validStatus;
            message.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        // Delete an enquiry
        public async Task<bool> DeleteMessageAsync(int id)
        {
            var message = await _context.ContactMessages
                .FirstOrDefaultAsync(x => x.Id == id);

            if (message == null)
            {
                return false;
            }

            _context.ContactMessages.Remove(message);

            await _context.SaveChangesAsync();

            return true;
        }

        // Map entity to response DTO
        private static ContactMessageResponseDto MapToDto(
            ContactMessage message)
        {
            return new ContactMessageResponseDto
            {
                Id = message.Id,
                Name = message.Name,
                Email = message.Email,
                Subject = message.Subject,
                Message = message.Message,
                Status = message.Status,
                CreatedAt = message.CreatedAt,
                UpdatedAt = message.UpdatedAt
            };
        }
    }
}
