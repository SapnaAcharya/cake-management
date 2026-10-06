using CakeManagementAPI.DTOs.Category;
using CakeManagementAPI.Models;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponseDto>> GetAllAsync();

        Task<CategoryResponseDto?> GetByIdAsync(int id);

        Task<CategoryResponseDto> CreateAsync(
            CreateCategoryDto dto);

        Task<bool> UpdateAsync(
            int id,
            UpdateCategoryDto dto);

        Task<bool> DeleteAsync(int id);
    }
}