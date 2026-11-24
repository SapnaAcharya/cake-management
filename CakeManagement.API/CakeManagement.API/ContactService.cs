
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Contact;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CakeManagementAPI.Services
{
    public class ContactService : IContactService
    {
        private readonly AppDbContext _context;

        public ContactService(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET CONTACT SETTINGS
        public async Task<ContactSettingsDto> GetContactSettingsAsync()
        {
            var settings = await _context.ContactSettings
                .FirstOrDefaultAsync(x => x.Id == 1);

            // Create default settings if no record exists
            if (settings == null)
            {
                settings = new ContactSettings
                {
                    Id = 1
                };

                _context.ContactSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            // Convert SubjectsJson into a List<string>
            List<string> subjects;

            try
            {
                subjects = JsonSerializer.Deserialize<List<string>>(
                    settings.SubjectsJson) ?? new List<string>();
            }
            catch (JsonException)
            {
                subjects = new List<string>();
            }

            // Get active FAQs
            var faqs = await _context.ContactFaqs
                .Where(x => x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new ContactFaqDto
                {
                    Id = x.Id,
                    Question = x.Question,
                    Answer = x.Answer,
                    DisplayOrder = x.DisplayOrder
                })
                .ToListAsync();

            return new ContactSettingsDto
            {
                HeroTitle = settings.HeroTitle,
                HeroText = settings.HeroText,

                Phone = settings.Phone,
                Email = settings.Email,
                Hours = settings.Hours,
                EmailNote = settings.EmailNote,

                Address = settings.Address,
                Latitude = settings.Latitude,
                Longitude = settings.Longitude,

                WhatsApp = settings.WhatsApp,
                Instagram = settings.Instagram,
                Facebook = settings.Facebook,

                Subjects = subjects,
                Faqs = faqs
            };
        }

        // 2. UPDATE CONTACT SETTINGS
        public async Task UpdateContactSettingsAsync(
            UpdateContactSettingsDto dto)
        {
            // Validate coordinates first
            if (dto.Latitude < -90 || dto.Latitude > 90)
                throw new ArgumentException("Invalid latitude.");

            if (dto.Longitude < -180 || dto.Longitude > 180)
                throw new ArgumentException("Invalid longitude.");

            var settings = await _context.ContactSettings
                .FirstOrDefaultAsync(x => x.Id == 1);

            // Create the settings record if it does not exist
            if (settings == null)
            {
                settings = new ContactSettings
                {
                    Id = 1
                };

                _context.ContactSettings.Add(settings);
            }

            settings.HeroTitle = dto.HeroTitle?.Trim() ?? string.Empty;
            settings.HeroText = dto.HeroText?.Trim() ?? string.Empty;

            settings.Phone = dto.Phone?.Trim() ?? string.Empty;
            settings.Email = dto.Email?.Trim() ?? string.Empty;
            settings.Hours = dto.Hours?.Trim() ?? string.Empty;
            settings.EmailNote = dto.EmailNote?.Trim() ?? string.Empty;

            settings.Address = dto.Address?.Trim() ?? string.Empty;
            settings.Latitude = dto.Latitude;
            settings.Longitude = dto.Longitude;

            settings.WhatsApp = dto.WhatsApp?.Trim();
            settings.Instagram = dto.Instagram?.Trim();
            settings.Facebook = dto.Facebook?.Trim();

            // Convert subjects list into JSON
            settings.SubjectsJson = JsonSerializer.Serialize(
                dto.Subjects ?? new List<string>());

            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // 3. GET ACTIVE FAQ
        public async Task<List<ContactFaqDto>> GetFaqsAsync()
        {
            return await _context.ContactFaqs
                .Where(x => x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new ContactFaqDto
                {
                    Id = x.Id,
                    Question = x.Question,
                    Answer = x.Answer,
                    DisplayOrder = x.DisplayOrder
                })
                .ToListAsync();
        }

        // 4. CREATE FAQ

        public async Task<ContactFaqDto> CreateFaqAsync(
    CreateContactFaqDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Question))
                throw new ArgumentException("FAQ question is required.");

            if (string.IsNullOrWhiteSpace(dto.Answer))
                throw new ArgumentException("FAQ answer is required.");

            // Normalize question for duplicate comparison
            var normalizedQuestion = NormalizeFaqQuestion(dto.Question);

            // Check all existing FAQs, including inactive ones
            var existingQuestions = await _context.ContactFaqs
                .Select(x => x.Question)
                .ToListAsync();

            var duplicateExists = existingQuestions.Any(x =>
                NormalizeFaqQuestion(x) == normalizedQuestion
            );

            if (duplicateExists)
            {
                throw new ArgumentException(
                    "This FAQ question already exists. Please enter a different question."
                );
            }

            // Store clean question while preserving capitalization
            var cleanQuestion = CleanFaqQuestion(dto.Question);

            var faq = new ContactFaq
            {
                Question = cleanQuestion,
                Answer = dto.Answer.Trim(),
                DisplayOrder = dto.DisplayOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ContactFaqs.Add(faq);
            await _context.SaveChangesAsync();

            return new ContactFaqDto
            {
                Id = faq.Id,
                Question = faq.Question,
                Answer = faq.Answer,
                DisplayOrder = faq.DisplayOrder
            };
        }


        // 5. UPDATE FAQ
        public async Task<ContactFaqDto?> UpdateFaqAsync(
    int id,
    CreateContactFaqDto dto)
        {
            var faq = await _context.ContactFaqs
                .FirstOrDefaultAsync(x => x.Id == id);

            if (faq == null)
                return null;

            if (string.IsNullOrWhiteSpace(dto.Question))
                throw new ArgumentException("FAQ question is required.");

            if (string.IsNullOrWhiteSpace(dto.Answer))
                throw new ArgumentException("FAQ answer is required.");

            var normalizedQuestion = NormalizeFaqQuestion(dto.Question);

            // Exclude the FAQ currently being edited
            var existingQuestions = await _context.ContactFaqs
                .Where(x => x.Id != id)
                .Select(x => x.Question)
                .ToListAsync();

            var duplicateExists = existingQuestions.Any(x =>
                NormalizeFaqQuestion(x) == normalizedQuestion
            );

            if (duplicateExists)
            {
                throw new ArgumentException(
                    "Another FAQ with this question already exists. Please enter a different question."
                );
            }

            faq.Question = CleanFaqQuestion(dto.Question);
            faq.Answer = dto.Answer.Trim();
            faq.DisplayOrder = dto.DisplayOrder;
            faq.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ContactFaqDto
            {
                Id = faq.Id,
                Question = faq.Question,
                Answer = faq.Answer,
                DisplayOrder = faq.DisplayOrder
            };
        }

        // 6. DELETE FAQ

        public async Task<bool> DeleteFaqAsync(int id)
        {
            var faq = await _context.ContactFaqs
                .FirstOrDefaultAsync(x => x.Id == id);

            if (faq == null)
                return false;

            _context.ContactFaqs.Remove(faq);

            await _context.SaveChangesAsync();

            return true;
        }

        // 7. Normalized FAQs
        private static string NormalizeFaqQuestion(string question)
        {
            return string.Join(
                " ",
                question.Split(
                    (char[]?)null,
                    StringSplitOptions.RemoveEmptyEntries
                )
            ).ToLowerInvariant();
        }

        // Clean question before saving while preserving capitalization
        private static string CleanFaqQuestion(string question)
        {
            return string.Join(
                " ",
                question.Split(
                    (char[]?)null,
                    StringSplitOptions.RemoveEmptyEntries
                )
            );
        }
    }
}
