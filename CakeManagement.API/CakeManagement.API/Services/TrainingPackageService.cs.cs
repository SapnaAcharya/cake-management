
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace CakeManagementAPI.Services
{
    public class TrainingPackageService : ITrainingPackageService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public TrainingPackageService(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<List<TrainingPackageResponseDto>>
            GetAllActiveAsync()
        {
            return await _context.TrainingPackages
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Fee)
                .Select(p => MapToResponse(p))
                .ToListAsync();
        }

        public async Task<TrainingPackageResponseDto?>
            GetActiveByIdAsync(int id)
        {
            var package = await _context.TrainingPackages
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    p => p.Id == id && p.IsActive);

            return package == null ? null : MapToResponse(package);
        }

        public async Task<TrainingPackageResponseDto> CreateAsync(
            CreateTrainingPackageDto dto)
        {
            string? imageUrl = null;

            if (dto.Image != null)
            {
                imageUrl = await SaveImageAsync(dto.Image);
            }

            var package = new TrainingPackage
            {
                Name = dto.Name.Trim(),
                SkillLevel = dto.SkillLevel,
                Description = dto.Description.Trim(),
                LearningOutcomes = dto.LearningOutcomes.Trim(),
                DurationInDays = dto.DurationInDays,
                Fee = dto.Fee,
                ImageUrl = imageUrl,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.TrainingPackages.Add(package);
            await _context.SaveChangesAsync();

            return MapToResponse(package);
        }

        public async Task<TrainingPackageResponseDto?>
            UpdateAsync(int id, UpdateTrainingPackageDto dto)
        {
            var package = await _context.TrainingPackages
                .FirstOrDefaultAsync(p => p.Id == id);

            if (package == null)
            {
                return null;
            }

            package.Name = dto.Name.Trim();
            package.SkillLevel = dto.SkillLevel;
            package.Description = dto.Description.Trim();
            package.LearningOutcomes = dto.LearningOutcomes.Trim();
            package.DurationInDays = dto.DurationInDays;
            package.Fee = dto.Fee;
            package.IsActive = dto.IsActive;

            // Only replace the image when a new file was uploaded
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var oldImageUrl = package.ImageUrl;

                package.ImageUrl = await SaveImageAsync(dto.Image);

                await _context.SaveChangesAsync();

                DeleteImageFile(oldImageUrl);
            }
            else
            {
                await _context.SaveChangesAsync();
            }

            return MapToResponse(package);
        }

        public async Task<bool> DeactivateAsync(int id)
        {
            var package = await _context.TrainingPackages
                .FirstOrDefaultAsync(p => p.Id == id);

            if (package == null)
            {
                return false;
            }

            package.IsActive = false;

            await _context.SaveChangesAsync();

            return true;
        }

        // Save uploaded image to wwwroot/uploads/training-packages
        private async Task<string> SaveImageAsync(
            IFormFile image)
        {
            const long maxFileSize = 5 * 1024 * 1024;

            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            if (image.Length == 0)
            {
                throw new ArgumentException("The uploaded image is empty.");
            }

            if (image.Length > maxFileSize)
            {
                throw new ArgumentException(
                    "Image size must not exceed 5 MB.");
            }

            var extension = Path.GetExtension(image.FileName)
                .ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed.");
            }

            var uploadsFolder = Path.Combine(
                _environment.WebRootPath ?? Path.Combine(
                    _environment.ContentRootPath, "wwwroot"),
                "uploads",
                "training-packages"
            );

            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";

            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(
                filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/training-packages/{fileName}";
        }

        private void DeleteImageFile(string? imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl)) return;

            var webRoot = _environment.WebRootPath ??
                Path.Combine(_environment.ContentRootPath, "wwwroot");

            var path = Path.Combine(webRoot, imageUrl.TrimStart('/')
                .Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }


        private static TrainingPackageResponseDto MapToResponse(
            TrainingPackage package)
        {
            return new TrainingPackageResponseDto
            {
                Id = package.Id,
                Name = package.Name,
                SkillLevel = package.SkillLevel,
                Description = package.Description,
                LearningOutcomes = package.LearningOutcomes,
                DurationInDays = package.DurationInDays,
                Fee = package.Fee,
                ImageUrl = package.ImageUrl,
                IsActive = package.IsActive
            };
        }
    }
}
