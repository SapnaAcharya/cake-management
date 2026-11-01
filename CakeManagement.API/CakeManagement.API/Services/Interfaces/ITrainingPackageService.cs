
using CakeManagementAPI.DTOs.Training;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface ITrainingPackageService
    {
        Task<List<TrainingPackageResponseDto>> GetAllActiveAsync();

        Task<TrainingPackageResponseDto?> GetActiveByIdAsync(int id);

        Task<TrainingPackageResponseDto> CreateAsync(
            CreateTrainingPackageDto dto);

        Task<TrainingPackageResponseDto?> UpdateAsync(
            int id,
            UpdateTrainingPackageDto dto);

        Task<bool> DeactivateAsync(int id);
    }
}
