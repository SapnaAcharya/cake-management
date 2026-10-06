using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Templates;
using CakeManagementAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class CakeTemplateService : ICakeTemplateService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public CakeTemplateService(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<IEnumerable<CakeTemplate>> GetAllAsync()
    {
        return await _context.CakeTemplates
            .AsNoTracking()
            .Include(t => t.Images)
            .Include(t => t.Sizes)
            .Include(t => t.Colors)
            .Include(t => t.Features)
            .AsSplitQuery()
            .OrderBy(t => t.Id)
            .ToListAsync();
    }

    public async Task<CakeTemplate?> GetByIdAsync(int id)
    {
        return await _context.CakeTemplates
            .AsNoTracking()
            .Include(t => t.Images)
            .Include(t => t.Sizes)
            .Include(t => t.Colors)
            .Include(t => t.Features)
            .AsSplitQuery()
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<CakeTemplate> CreateAsync(CreateCakeTemplateDto dto)
    {
        var exists = await _context.CakeTemplates
            .AnyAsync(t => t.Name.ToLower() == dto.Name.ToLower());

        if (exists) 
            throw new InvalidOperationException($"A template named '{dto.Name}' already exists.");
        var template = new CakeTemplate
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            IsPopular = dto.IsPopular,
            Tiers = dto.Tiers,
            BasePrice = dto.BasePrice,
            MinPrepHours = dto.MinPrepHours,
            MaxPrepHours = dto.MaxPrepHours,
            CreatedAt = DateTime.UtcNow,
            Sizes = dto.Sizes
                .Select(s => new CakeTemplateSize { SizeInInches = s })
                .ToList(),
            Colors = dto.Colors
                .Select(c => new CakeTemplateColor { ColorName = c.Name, ColorHex = c.Hex })
                .ToList(),
            Features = dto.Features
                .Select(f => new CakeTemplateFeature { FeatureName = f })
                .ToList(),
            Images = BuildImageEntities(dto.Images),
        };

        _context.CakeTemplates.Add(template);
        await _context.SaveChangesAsync();

        return template;
    }

    private static List<CakeTemplateImage> BuildImageEntities(CreateTemplateImageDto? dto)
    {
        var images = new List<CakeTemplateImage>();

        if (dto == null)
            return images;

        if (!string.IsNullOrEmpty(dto.Thumb))
            images.Add(new CakeTemplateImage { ImageUrl = dto.Thumb, ImageType = "thumb" });

        if (!string.IsNullOrEmpty(dto.Preview))
            images.Add(new CakeTemplateImage { ImageUrl = dto.Preview, ImageType = "preview" });

        images.AddRange(dto.Gallery
            .Where(url => !string.IsNullOrEmpty(url))
            .Select(url => new CakeTemplateImage { ImageUrl = url, ImageType = "gallery" }));

        images.AddRange(dto.TierImages
            .Where(t => !string.IsNullOrEmpty(t.ImageUrl))
            .Select(t => new CakeTemplateImage
            {
                ImageUrl = t.ImageUrl,
                ImageType = "tier",
                TierCount = t.TierCount
            }));
        return images;
    }

    public async Task<CakeTemplate?> AddImagesAsync(int templateId, CreateTemplateImageDto dto)
    {
        var template = await _context.CakeTemplates.FindAsync(templateId);
        if (template == null)
            return null;

        var images = BuildImageEntities(dto);
        foreach (var image in images)
            image.CakeTemplateId = templateId;

        _context.CakeTemplateImages.AddRange(images);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(templateId);
    }

    public async Task<string?> SaveTemplateImageAsync(IFormFile? image)
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

        var uploadsFolder = Path.Combine(
            _environment.WebRootPath,
            "images",
            "templates");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var fileName = $"{Guid.NewGuid()}{extension}";

        var filePath = Path.Combine(uploadsFolder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);

        await image.CopyToAsync(stream);

        return $"/images/templates/{fileName}";
    }

    public async Task<CakeTemplate?> UpdateAsync(int id, UpdateCakeTemplateDto dto)
    {
        var template = await _context.CakeTemplates
            .Include(t => t.Sizes)
            .Include(t => t.Colors)
            .Include(t => t.Features)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null)
            return null;

        template.Name = dto.Name;
        template.Description = dto.Description;
        template.Category = dto.Category;
        template.IsPopular = dto.IsPopular;
        template.Tiers = dto.Tiers;
        template.BasePrice = dto.BasePrice;
        template.MinPrepHours = dto.MinPrepHours;
        template.MaxPrepHours = dto.MaxPrepHours;

        // Replace child collections wholesale — simplest correct approach for now
        _context.RemoveRange(template.Sizes!);
        _context.RemoveRange(template.Colors!);
        _context.RemoveRange(template.Features!);

        template.Sizes = dto.Sizes
            .Select(s => new CakeTemplateSize { SizeInInches = s, CakeTemplateId = id })
            .ToList();
        template.Colors = dto.Colors
            .Select(c => new CakeTemplateColor { ColorName = c.Name, ColorHex = c.Hex, CakeTemplateId = id })
            .ToList();
        template.Features = dto.Features
            .Select(f => new CakeTemplateFeature { FeatureName = f, CakeTemplateId = id })
            .ToList();

        await _context.SaveChangesAsync();

        return template;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var template = await _context.CakeTemplates.FindAsync(id);

        if (template == null)
            return false;

        _context.CakeTemplates.Remove(template);
        await _context.SaveChangesAsync();

        return true;
    }

    [HttpGet("featured")]
    public async Task<List<FeaturedTemplateDto>> GetFeaturedAsync(int count)
    {
        return await _context.CakeTemplates
            .Where(t => t.IsPopular)          // use a property that exists on your model
            .OrderBy(t => t.Id)
            .Take(count)
            .Select(t => new FeaturedTemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                BasePrice = t.BasePrice,
                Category = t.Category,        // if Category is an entity, use t.Category.Name
                ImageUrl = t.Images
                    .Where(i => i.ImageType.ToLower() == "thumb")
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
                    ?? t.Images.Select(i => i.ImageUrl).FirstOrDefault(),
                Images = t.Images.Select(i => new TemplateImageDto
                {
                    ImageType = i.ImageType,
                    ImageUrl = i.ImageUrl,
                    TierCount = i.TierCount
                }).ToList()
            })
            .ToListAsync();
    }
}