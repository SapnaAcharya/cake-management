using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Decoration;
using CakeManagementAPI.Helpers;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class DecorationService : IDecorationService
    {
        private readonly AppDbContext _context;
        private readonly IImageService _imageService;

        public DecorationService(AppDbContext context, IImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        public async Task<DecorationResponseDto> CreateAsync(CreateDecorationDto dto)
        {
            if (dto.Price < 0)
            {
                throw new ArgumentException("Decoration price cannot be negative.");
            }

            var existingDecoration = await _context.Decorations
                .FirstOrDefaultAsync(d =>
                     d.Name.ToLower() == dto.Name.ToLower()
                     &&
                     d.Category.ToLower() == dto.Category.ToLower()
                );

            if (existingDecoration != null)
            {
                throw new InvalidOperationException(
                    "A decoration with this name and category already exists.");
            }

            var decoration = new Decoration
            {
                Name = dto.Name,
                Category = dto.Category,
                ImageUrl = dto.ImageUrl,
                Price = dto.Price,
                Occasion = dto.Occasion,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Decorations.Add(decoration);
            await _context.SaveChangesAsync();

            return MapToDto(decoration);
        }

        public async Task<List<DecorationResponseDto>> GetAllAsync()
        {
            var decorations = await _context.Decorations
                .AsNoTracking()
                .OrderBy(d => d.Name)
                .ToListAsync();

            return decorations
                .Select(MapToDto)
                .ToList();
        }

        public async Task<DecorationResponseDto?> GetByIdAsync(int id)
        {
            var decoration = await _context.Decorations
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);

            if (decoration == null)
                return null;

            return MapToDto(decoration);
        }

        public async Task<List<DecorationResponseDto>> GetByCategoryAsync(string category)
        {
            var decorations = await _context.Decorations
                .AsNoTracking()
                .Where(d => d.Category == category)
                .ToListAsync();

            return decorations
                .Select(MapToDto)
                .ToList();
        }

        public async Task<DecorationResponseDto?> UpdateAsync(int id, UpdateDecorationDto dto)
        {
            if (dto.Price < 0)
            {
                throw new ArgumentException("Decoration price cannot be negative.");
            }

            var decoration = await _context.Decorations
                .FirstOrDefaultAsync(d => d.Id == id);

            if (decoration == null)
                return null;

            decoration.Name = dto.Name;
            decoration.Category = dto.Category;
            decoration.ImageUrl = dto.ImageUrl;
            decoration.Price = dto.Price;
            decoration.Occasion = dto.Occasion;
            decoration.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return MapToDto(decoration);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var decoration = await _context.Decorations
                .FirstOrDefaultAsync(d => d.Id == id);

            if (decoration == null)
                return false;

            _context.Decorations.Remove(decoration);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<string?> SaveDecorationImageAsync(IFormFile? image, string? category)
        {
            if (image == null || image.Length == 0)
                return null;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                throw new InvalidOperationException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed.");
            }

            const long maxFileSize = 5 * 1024 * 1024;

            if (image.Length > maxFileSize)
            {
                throw new InvalidOperationException(
                    "Image size cannot exceed 5 MB.");
            }

            // One Cloudinary folder per category, with a safe folder name
            var subfolder = string.IsNullOrWhiteSpace(category)
                ? "general"
                : SlugHelper.Generate(category, "general");

            return await _imageService.UploadAsync(image, $"decorations/{subfolder}");
        }

        private static DecorationResponseDto MapToDto(Decoration decoration)
        {
            return new DecorationResponseDto
            {
                Id = decoration.Id,
                Name = decoration.Name,
                Category = decoration.Category,
                ImageUrl = decoration.ImageUrl,
                Price = decoration.Price,
                Occasion = decoration.Occasion,
                IsActive = decoration.IsActive,
                CreatedAt = decoration.CreatedAt
            };
        }
    }
}