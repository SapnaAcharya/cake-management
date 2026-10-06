using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Decoration;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class DecorationService : IDecorationService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public DecorationService(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<DecorationResponseDto> CreateAsync(CreateDecorationDto dto)
        {
            if (dto.Price < 0)
            {
                throw new ArgumentException("Decoration price cannot be negative.");
            }

            //var existingDecoration = await _context.Decorations
            //    .FirstOrDefaultAsync(d => d.Name.ToLower() == dto.Name.ToLower());

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

            var subfolder = string.IsNullOrWhiteSpace(category) ? "general" : category;
            
            var uploadsFolder = Path.Combine(
                _environment.WebRootPath,
                "images",
                "decorations",
                subfolder);

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            return $"/images/decorations/{subfolder}/{fileName}";
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