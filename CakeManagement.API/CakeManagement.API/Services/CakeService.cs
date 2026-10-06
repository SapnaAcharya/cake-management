using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Cake;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;

namespace CakeManagementAPI.Services
{
    public class CakeService : ICakeService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public CakeService(AppDbContext context, 
                          IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
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
                    Description = c.Description,
                    Price = c.Price,
                    StockQuantity = c.StockQuantity,
                    ImageUrl = c.ImageUrl,
                    IsAvailable = c.IsAvailable,
                    DesignType = c.DesignType,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    CategoryId = c.CategoryId,
                    CategoryName = c.Category != null ? c.Category.Name : string.Empty
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
                    Description = c.Description,
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

            var cake = new Cake
            {
                Name = dto.Name,
                Description = dto.Description,
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

            // Check whether category exists
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

            // Update cake information
            cake.Name = dto.Name;
            cake.Description = dto.Description;
            cake.Price = dto.Price;
            cake.StockQuantity = dto.StockQuantity;
           // cake.ImageUrl = dto.ImageUrl;
            cake.IsAvailable = dto.IsAvailable;
            cake.DesignType = dto.DesignType;
            cake.CategoryId = dto.CategoryId;
            cake.UpdatedAt = DateTime.UtcNow;

            // If a new image was uploaded
            if (dto.Image != null)
            {
                // Keep the old image path
                var oldImageUrl = cake.ImageUrl;

                // Save the new image
                var newImageUrl = await SaveImageAsync(dto.Image);

                // Update database with new image path
                cake.ImageUrl = newImageUrl;

                // Delete old image from wwwroot
                DeleteImage(oldImageUrl);

            }
                await _context.SaveChangesAsync();

            return true;
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

            var uploadsFolder = Path.Combine(
                _environment.WebRootPath,
                "images",
                "cakes");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName =
                $"{Guid.NewGuid()}{extension}";

            var filePath = Path.Combine(
                uploadsFolder,
                fileName);

            using var stream =
                new FileStream(filePath, FileMode.Create);

            await image.CopyToAsync(stream);

            return $"/images/cakes/{fileName}";
        }

        private void DeleteImage(string? imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
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