using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Cake;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using System.Text.RegularExpressions;
using CakeManagementAPI.Helpers;

namespace CakeManagementAPI.Services
{
    public class CakeService : ICakeService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IImageService _imageService;

        public CakeService(AppDbContext context,
                          IWebHostEnvironment environment,
                          IImageService imageService)
        {
            _context = context;
            _environment = environment;
            _imageService = imageService;
        }

        public async Task<PaginatedResponseDto<CakeResponseDto>> GetAllAsync(
            int pageNumber, int pageSize, int? categoryId = null)
        {
            if (pageNumber < 1)
                pageNumber = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var query = _context.Cakes
                .AsNoTracking();

            if (categoryId.HasValue)
            {
                query = query.Where(c => c.CategoryId == categoryId.Value);
            }

            var totalItems = await query.CountAsync();

            var cakes = await query
                .OrderBy(c => c.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CakeResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    Price = c.Price,
                    StockQuantity = c.StockQuantity,
                    ImageUrl = c.ImageUrl,
                    IsAvailable = c.IsAvailable,
                    DesignType = c.DesignType,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    CategoryId = c.CategoryId,
                    CategoryName = c.Category != null ? c.Category.Name : string.Empty,
                    // Personalized message settings
                    AllowMessage = c.AllowMessage,
                    MessageLabel = c.MessageLabel,
                    MessagePlaceholder = c.MessagePlaceholder,
                    MaxMessageLength = c.MaxMessageLength,
                    MessageAdditionalPrice = c.MessageAdditionalPrice

                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            return new PaginatedResponseDto<CakeResponseDto>
            {
                Items = cakes,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                HasPreviousPage = pageNumber > 1,
                HasNextPage = pageNumber < totalPages
            };
        }

        public async Task<CakeResponseDto?> GetByIdAsync(int id)
        {
            return await _context.Cakes
                .Include(c => c.Category)
                .Where(c => c.Id == id)
                .Select(c => new CakeResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    AllowMessage = c.AllowMessage,
                    MessageLabel = c.MessageLabel,
                    MessagePlaceholder = c.MessagePlaceholder,
                    MaxMessageLength = c.MaxMessageLength,
                    MessageAdditionalPrice = c.MessageAdditionalPrice,
                    Price = c.Price,
                    StockQuantity = c.StockQuantity,
                    ImageUrl = c.ImageUrl,
                    IsAvailable = c.IsAvailable,
                    DesignType = c.DesignType,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    CategoryId = c.CategoryId,
                    CategoryName = c.Category != null
                        ? c.Category.Name
                        : string.Empty
                })
                .FirstOrDefaultAsync();
        }


        public async Task<CakeResponseDto?> GetBySlugAsync(string slug)
        {
            return await _context.Cakes
                .AsNoTracking()
                .Where(c => c.Slug == slug)
                .Select(c => new CakeResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    AllowMessage = c.AllowMessage,
                    MessageLabel = c.MessageLabel,
                    MessagePlaceholder = c.MessagePlaceholder,
                    MaxMessageLength = c.MaxMessageLength,
                    MessageAdditionalPrice = c.MessageAdditionalPrice,
                    Price = c.Price,
                    StockQuantity = c.StockQuantity,
                    ImageUrl = c.ImageUrl,
                    IsAvailable = c.IsAvailable,
                    DesignType = c.DesignType,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    CategoryId = c.CategoryId,
                    CategoryName = c.Category != null
                        ? c.Category.Name
                        : string.Empty
                })
                .FirstOrDefaultAsync();
        }


        public async Task<CakeResponseDto> CreateAsync(
            CreateCakeDto dto)
        {
            // Check whether category exists
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
            {
                throw new KeyNotFoundException(
                    $"Category with id {dto.CategoryId} was not found.");
            }

            // Check duplicate cake name
            var cakeExists = await _context.Cakes
                .AnyAsync(c =>
                    c.Name.ToLower() == dto.Name.ToLower());

            if (cakeExists)
            {
                throw new InvalidOperationException(
                    "A cake with this name already exists.");
            }

            var imageUrl = await SaveImageAsync(dto.Image);

            var slug = await GenerateUniqueSlugAsync(dto.Name);

            var cake = new Cake
            {
                Name = dto.Name,
                Slug = slug,
                Description = dto.Description,

                // Personalized cake message settings
                AllowMessage = dto.AllowMessage,
                MessageLabel = dto.MessageLabel,
                MessagePlaceholder = dto.MessagePlaceholder,
                MaxMessageLength = dto.MaxMessageLength,
                MessageAdditionalPrice = dto.MessageAdditionalPrice,
                
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                ImageUrl = imageUrl,
                IsAvailable = dto.IsAvailable,
                DesignType = dto.DesignType,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Cakes.Add(cake);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(cake.Id)
                ?? throw new InvalidOperationException(
                    "Failed to retrieve the created cake.");
        }
        
public async Task<bool> UpdateAsync(
    int id,
    UpdateCakeDto dto)
{
    var cake = await _context.Cakes
        .FirstOrDefaultAsync(c => c.Id == id);

    if (cake == null)
    {
        return false;
    }

    // Check category
    var categoryExists = await _context.Categories
        .AnyAsync(c => c.Id == dto.CategoryId);

    if (!categoryExists)
    {
        throw new KeyNotFoundException(
            $"Category with id {dto.CategoryId} was not found.");
    }

    // Check duplicate cake name
    var duplicate = await _context.Cakes
        .AnyAsync(c =>
            c.Id != id &&
            c.Name.ToLower() == dto.Name.ToLower());

    if (duplicate)
    {
        throw new InvalidOperationException(
            "A cake with this name already exists.");
    }

    // Update basic cake information
    cake.Name = dto.Name.Trim();
    cake.Description = dto.Description;
    cake.Price = dto.Price;
    cake.StockQuantity = dto.StockQuantity;
    cake.IsAvailable = dto.IsAvailable;
    cake.DesignType = dto.DesignType;
    cake.CategoryId = dto.CategoryId;

    cake.IsFeatured = dto.IsFeatured;
    cake.IsBestSeller = dto.IsBestSeller;
    cake.IsTrending = dto.IsTrending;

    // Update personalized-message settings
    // ONLY when values are provided.

    if (dto.AllowMessage.HasValue)
    {
        cake.AllowMessage = dto.AllowMessage.Value;
    }

    if (dto.MessageLabel != null)
    {
        cake.MessageLabel = dto.MessageLabel.Trim();
    }

    if (dto.MessagePlaceholder != null)
    {
        cake.MessagePlaceholder =
            dto.MessagePlaceholder.Trim();
    }

    if (dto.MaxMessageLength.HasValue)
    {
        cake.MaxMessageLength =
            dto.MaxMessageLength.Value;
    }

    if (dto.MessageAdditionalPrice.HasValue)
    {
        cake.MessageAdditionalPrice =
            dto.MessageAdditionalPrice.Value;
    }

    // Validate configuration when enabled
    if (cake.AllowMessage && cake.MaxMessageLength < 1)
    {
        throw new InvalidOperationException(
            "Maximum message length must be greater than zero.");
    }

    // Update image if a new image was uploaded
    if (dto.Image != null)
    {
        var oldImageUrl = cake.ImageUrl;

        var newImageUrl = await SaveImageAsync(dto.Image);

        if (newImageUrl != null)
        {
            cake.ImageUrl = newImageUrl;

            DeleteImage(oldImageUrl);
        }
    }

    cake.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return true;
}


public async Task<bool> UpdateMessageSettingsAsync(
    int id,
    UpdateCakeMessageSettingsDto dto)
{
    var cake = await _context.Cakes.FindAsync(id);

    if (cake == null)
    {
        return false;
    }

    if (dto.AllowMessage &&
        (!dto.MaxMessageLength.HasValue || dto.MaxMessageLength.Value < 1))
    {
        throw new ArgumentException(
            "Max length must be at least 1 when messages are enabled.");
    }

    if (dto.MessageAdditionalPrice < 0)
    {
        throw new ArgumentException(
            "Additional price cannot be negative.");
    }

    cake.AllowMessage = dto.AllowMessage;

    if (dto.MessageLabel != null)
    {
        cake.MessageLabel = string.IsNullOrWhiteSpace(dto.MessageLabel)
            ? "Personalized Message"
            : dto.MessageLabel.Trim();
    }

    if (dto.MessagePlaceholder != null)
    {
        cake.MessagePlaceholder = string.IsNullOrWhiteSpace(dto.MessagePlaceholder)
            ? "Enter your message"
            : dto.MessagePlaceholder.Trim();
    }

    if (dto.MaxMessageLength.HasValue)
    {
        cake.MaxMessageLength = dto.MaxMessageLength.Value;
    }

    cake.MessageAdditionalPrice = dto.MessageAdditionalPrice;

    cake.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return true;
}

        private async Task<string> GenerateUniqueSlugAsync(string name)
        {
            var slug = SlugHelper.Generate(name, "cake");

            // Avoid clashing with the fixed routes: featured, best-sellers, trending
            if (slug is "featured" or "best-sellers" or "trending")
                slug = "cake";

            var uniqueSlug = slug;
            var counter = 2;

            while (await _context.Cakes.AnyAsync(c => c.Slug == uniqueSlug))
            {
                uniqueSlug = $"{slug}-{counter}";
                counter++;
            }

            return uniqueSlug;
        }

        private async Task<string?> SaveImageAsync(IFormFile? image)
        {
            if (image == null || image.Length == 0)
            {
                return null;
            }

            var allowedExtensions = new[]
            {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

            var extension =
                Path.GetExtension(image.FileName).ToLowerInvariant();

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

            // Upload to Cloudinary and return the full https URL
            return await _imageService.UploadAsync(image, "cakes");
        }

        private void DeleteImage(string? imageUrl)
        {
            // Only old images stored on this server disk are deleted 
            // Cloudinary URLs (https://...) are skipped.
            if (string.IsNullOrEmpty(imageUrl) || 
                !imageUrl.StartsWith("/images/cakes/"))
            {
                return;
            }

            var fileName = Path.GetFileName(imageUrl);

            var filePath = Path.Combine(
                _environment.WebRootPath,
                "images",
                "cakes",
                fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var cake = await _context.Cakes
                .Include(c => c.CartItems)
                .Include(c => c.OrderItems)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cake == null)
            {
                return false;
            }

            // Don't delete a cake that is already
            // being used in a cart or order.
            if (cake.CartItems.Any())
            {
                throw new InvalidOperationException(
                    "Cannot delete this cake because it exists in a cart.");
            }

            if (cake.OrderItems.Any())
            {
                throw new InvalidOperationException(
                    "Cannot delete this cake because it exists in an order.");
            }

            _context.Cakes.Remove(cake);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}