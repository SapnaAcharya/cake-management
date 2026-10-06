using CakeManagementAPI.Models;
using CakeManagementAPI.DTOs.Templates;

public interface ICakeTemplateService
{
    Task<IEnumerable<CakeTemplate>> GetAllAsync();

    Task<CakeTemplate?> GetByIdAsync(int id);

    Task<CakeTemplate> CreateAsync(CreateCakeTemplateDto dto);

    Task<CakeTemplate?> UpdateAsync(int id, UpdateCakeTemplateDto dto);

    Task<CakeTemplate?> AddImagesAsync(int templateId, CreateTemplateImageDto dto);

    Task<string?> SaveTemplateImageAsync(IFormFile? image);
    Task<bool> DeleteAsync(int id);

    Task<List<FeaturedTemplateDto>> GetFeaturedAsync(int count);
}
