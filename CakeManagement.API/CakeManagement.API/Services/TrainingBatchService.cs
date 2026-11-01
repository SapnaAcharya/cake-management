using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class TrainingBatchService : ITrainingBatchService
    {
        private readonly AppDbContext _context;

        public TrainingBatchService(AppDbContext context)
        {
            _context = context;
        }

        // Get batches available for customer registration.
        public async Task<List<TrainingBatchResponseDto>> GetAllOpenAsync()
        {
            return await _context.TrainingBatches
                .AsNoTracking()
                .Where(b =>
                    b.Status == "Open" &&
                    b.TrainingPackage.IsActive &&
                    b.Trainer.IsActive)
                .OrderBy(b => b.StartDate)
                .Select(b => new TrainingBatchResponseDto
                {
                    Id = b.Id,
                    TrainingPackageId = b.TrainingPackageId,
                    TrainingPackageName = b.TrainingPackage.Name,
                    TrainerId = b.TrainerId,
                    TrainerName = b.Trainer.FullName,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    ScheduleDetails = b.ScheduleDetails,
                    Capacity = b.Capacity,
                    RegisteredCount = _context.TrainingEnrollments
    .Count(e => e.TrainingBatchId == b.Id && e.Status == "Confirmed"),
                    Status = b.Status
                })
                .ToListAsync();
        }

        // Get one batch that is open for registration.
        public async Task<TrainingBatchResponseDto?> GetOpenByIdAsync(int id)
        {
            return await _context.TrainingBatches
                .AsNoTracking()
                .Where(b =>
                    b.Id == id &&
                    b.Status == "Open" &&
                    b.TrainingPackage.IsActive &&
                    b.Trainer.IsActive)
                .Select(b => new TrainingBatchResponseDto
                {
                    Id = b.Id,
                    TrainingPackageId = b.TrainingPackageId,
                    TrainingPackageName = b.TrainingPackage.Name,
                    TrainerId = b.TrainerId,
                    TrainerName = b.Trainer.FullName,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    ScheduleDetails = b.ScheduleDetails,
                    Capacity = b.Capacity,
                    RegisteredCount = _context.TrainingEnrollments
    .Count(e => e.TrainingBatchId == b.Id && e.Status == "Confirmed"),
                    Status = b.Status
                })
                .FirstOrDefaultAsync();
        }

        
        // Admin: Get all training batches, regardless of status.
        public async Task<List<TrainingBatchResponseDto>> GetAllAsync()
        {
            return await _context.TrainingBatches
                .AsNoTracking()
                .OrderBy(b => b.StartDate)
                .Select(b => new TrainingBatchResponseDto
                {
                    Id = b.Id,
                    TrainingPackageId = b.TrainingPackageId,
                    TrainingPackageName = b.TrainingPackage.Name,
                    TrainerId = b.TrainerId,
                    TrainerName = b.Trainer.FullName,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    ScheduleDetails = b.ScheduleDetails,
                    Capacity = b.Capacity,
                    RegisteredCount = _context.TrainingEnrollments
                       .Count(e => e.TrainingBatchId == b.Id && e.Status == "Confirmed"),
                    Status = b.Status
                })
                .ToListAsync();
        }

        // Admin: Get one training batch by ID, regardless of status.
        public async Task<TrainingBatchResponseDto?> GetByIdAsync(int id)
        {
            return await _context.TrainingBatches
                .AsNoTracking()
                .Where(b => b.Id == id)
                .Select(b => new TrainingBatchResponseDto
                {
                    Id = b.Id,
                    TrainingPackageId = b.TrainingPackageId,
                    TrainingPackageName = b.TrainingPackage.Name,
                    TrainerId = b.TrainerId,
                    TrainerName = b.Trainer.FullName,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    ScheduleDetails = b.ScheduleDetails,
                    Capacity = b.Capacity,
                    RegisteredCount = _context.TrainingEnrollments
    .Count(e =>
        e.TrainingBatchId == b.Id &&
        e.Status == "Confirmed"),
                    Status = b.Status
                })
                .FirstOrDefaultAsync();
        }


        // Create a new batch.
        public async Task<TrainingBatchResponseDto> CreateAsync(
            CreateTrainingBatchDto dto)
        {
            ValidateDates(dto.StartDate, dto.EndDate);

            var package = await _context.TrainingPackages
                .FirstOrDefaultAsync(p =>
                    p.Id == dto.TrainingPackageId && p.IsActive);

            if (package == null)
            {
                throw new InvalidOperationException(
                    "The selected training package does not exist or is inactive.");
            }

            var trainer = await _context.Trainers
                .FirstOrDefaultAsync(t =>
                    t.Id == dto.TrainerId && t.IsActive);

            if (trainer == null)
            {
                throw new InvalidOperationException(
                    "The selected trainer does not exist or is inactive.");
            }

            var batch = new TrainingBatch
            {
                TrainingPackageId = dto.TrainingPackageId,
                TrainerId = dto.TrainerId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ScheduleDetails = dto.ScheduleDetails.Trim(),
                Capacity = dto.Capacity,
                Status = "Open"
            };

            _context.TrainingBatches.Add(batch);
            await _context.SaveChangesAsync();

            return await GetResponseByIdAsync(batch.Id);
        }

        // Update an existing batch.
        public async Task<TrainingBatchResponseDto?> UpdateAsync(
            int id,
            UpdateTrainingBatchDto dto)
        {
            ValidateDates(dto.StartDate, dto.EndDate);

            var batch = await _context.TrainingBatches
                .FirstOrDefaultAsync(b => b.Id == id);

            if (batch == null)
            {
                return null;
            }

            var package = await _context.TrainingPackages
                .FirstOrDefaultAsync(p =>
                    p.Id == dto.TrainingPackageId && p.IsActive);

            if (package == null)
            {
                throw new InvalidOperationException(
                    "The selected training package does not exist or is inactive.");
            }

            var trainer = await _context.Trainers
                .FirstOrDefaultAsync(t =>
                    t.Id == dto.TrainerId && t.IsActive);

            if (trainer == null)
            {
                throw new InvalidOperationException(
                    "The selected trainer does not exist or is inactive.");
            }

            var registeredCount = await _context.TrainingEnrollments
    .CountAsync(e =>
        e.TrainingBatchId == id &&
        e.Status == "Confirmed");

            if (dto.Capacity < registeredCount)
            {
                throw new InvalidOperationException(
                    $"Capacity cannot be less than the {registeredCount} confirmed enrollments.");
            }

            batch.TrainingPackageId = dto.TrainingPackageId;
            batch.TrainerId = dto.TrainerId;
            batch.StartDate = dto.StartDate;
            batch.EndDate = dto.EndDate;
            batch.ScheduleDetails = dto.ScheduleDetails.Trim();
            batch.Capacity = dto.Capacity;
            batch.Status = dto.Status;

            await _context.SaveChangesAsync();

            return await GetResponseByIdAsync(batch.Id);
        }

        // Close a batch without deleting its registrations.
        public async Task<bool> CloseAsync(int id)
        {
            var batch = await _context.TrainingBatches
                .FirstOrDefaultAsync(b => b.Id == id);

            if (batch == null)
            {
                return false;
            }

            batch.Status = "Closed";

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<TrainingBatchResponseDto> GetResponseByIdAsync(
            int id)
        {
            var response = await _context.TrainingBatches
                .AsNoTracking()
                .Where(b => b.Id == id)
                .Select(b => new TrainingBatchResponseDto
                {
                    Id = b.Id,
                    TrainingPackageId = b.TrainingPackageId,
                    TrainingPackageName = b.TrainingPackage.Name,
                    TrainerId = b.TrainerId,
                    TrainerName = b.Trainer.FullName,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    ScheduleDetails = b.ScheduleDetails,
                    Capacity = b.Capacity,
                    RegisteredCount = _context.TrainingEnrollments
    .Count(e => e.TrainingBatchId == b.Id && e.Status == "Confirmed"),
                    Status = b.Status
                })
                .FirstOrDefaultAsync();

            return response ?? throw new InvalidOperationException(
                "The training batch could not be retrieved after saving.");
        }

        private static void ValidateDates(DateTime startDate, DateTime endDate)
        {
            if (startDate == default || endDate == default)
            {
                throw new InvalidOperationException(
                    "Both start date and end date are required.");
            }

            if (endDate.Date < startDate.Date)
            {
                throw new InvalidOperationException(
                    "The end date cannot be earlier than the start date.");
            }
        }
    }
}
