
using CakeManagementAPI.DTOs.Training;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface ITrainerService
    {
        Task<List<TrainerResponseDto>> GetAllActiveAsync();

        Task<List<TrainerResponseDto>> GetAllAsync();

        Task<TrainerResponseDto?> GetActiveByIdAsync(int id);

        Task<bool> ActivateAsync(int id);
    
        Task<TrainerResponseDto> CreateAsync(
            CreateTrainerDto dto);

        Task<TrainerResponseDto?> UpdateAsync(
            int id,
            UpdateTrainerDto dto);

        Task<bool> DeactivateAsync(int id);
    }
}
