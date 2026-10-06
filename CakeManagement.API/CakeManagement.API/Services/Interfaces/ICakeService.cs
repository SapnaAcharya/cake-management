using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Cake;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface ICakeService
    {
        Task<PaginatedResponseDto<CakeResponseDto>> GetAllAsync( int pageNumber, int pageSize, int? categoryId = null);

        Task<CakeResponseDto?> GetByIdAsync(int id);

        Task<CakeResponseDto> CreateAsync(CreateCakeDto dto);

        Task<bool> UpdateAsync(int id, UpdateCakeDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
