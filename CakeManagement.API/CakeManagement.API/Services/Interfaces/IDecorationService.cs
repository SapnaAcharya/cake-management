using CakeManagementAPI.DTOs.Decoration;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IDecorationService
    {
        Task<DecorationResponseDto> CreateAsync(
            CreateDecorationDto dto);

        Task<List<DecorationResponseDto>> GetAllAsync();

        Task<DecorationResponseDto?> GetByIdAsync(int id);

        Task<List<DecorationResponseDto>> GetByCategoryAsync(
            string category);

        Task<string?> SaveDecorationImageAsync(
            IFormFile? image, string? category);
        Task<DecorationResponseDto?> UpdateAsync(
            int id, UpdateDecorationDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
