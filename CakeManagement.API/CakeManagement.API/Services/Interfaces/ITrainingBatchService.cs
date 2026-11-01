
using CakeManagementAPI.DTOs.Training;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface ITrainingBatchService
    {
        Task<List<TrainingBatchResponseDto>> GetAllOpenAsync();

        Task<TrainingBatchResponseDto?> GetOpenByIdAsync(int id);

        // Admin: get all batches, including closed and cancelled.
        Task<List<TrainingBatchResponseDto>> GetAllAsync();

        // Admin: get any batch by ID, regardless of status.
        Task<TrainingBatchResponseDto?> GetByIdAsync(int id);
        Task<TrainingBatchResponseDto> CreateAsync(
            CreateTrainingBatchDto dto);

        Task<TrainingBatchResponseDto?> UpdateAsync(
            int id,
            UpdateTrainingBatchDto dto);

        Task<bool> CloseAsync(int id);
    }
}
