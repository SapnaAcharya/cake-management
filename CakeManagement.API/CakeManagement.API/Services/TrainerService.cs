
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class TrainerService : ITrainerService
    {
        private readonly AppDbContext _context;

        public TrainerService(AppDbContext context)
        {
            _context = context;
        }

        // Get all active trainers.
        public async Task<List<TrainerResponseDto>> GetAllActiveAsync()
        {
            return await _context.Trainers
                .AsNoTracking()
                .Where(t => t.IsActive)
                .OrderBy(t => t.FullName)
                .Select(t => MapToResponse(t))
                .ToListAsync();
        }

        // Get all trainers including the active and inactive one.

        public async Task<List<TrainerResponseDto>> GetAllAsync()
        {
            var trainers = await _context.Trainers
                .AsNoTracking()
                .OrderBy(t => t.FullName)
                .Select(t => new TrainerResponseDto
                {
                    Id = t.Id,
                    FullName = t.FullName,
                    Qualifications = t.Qualifications,
                    Bio = t.Bio,
                    Email = t.Email,
                    PhoneNumber = t.PhoneNumber,
                    IsActive = t.IsActive
                })
                .ToListAsync();

            return trainers;
        }


        // Get one active trainer by ID.
        public async Task<TrainerResponseDto?> GetActiveByIdAsync(int id)
        {
            var trainer = await _context.Trainers
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    t => t.Id == id && t.IsActive);

            return trainer == null ? null : MapToResponse(trainer);
        }

        // Create a trainer.
        public async Task<TrainerResponseDto> CreateAsync(
            CreateTrainerDto dto)
        {
            var trainer = new Trainer
            {
                FullName = dto.FullName.Trim(),
                Qualifications = dto.Qualifications.Trim(),
                Bio = dto.Bio?.Trim(),
                Email = dto.Email?.Trim(),
                PhoneNumber = dto.PhoneNumber?.Trim(),
                IsActive = true
            };

            _context.Trainers.Add(trainer);
            await _context.SaveChangesAsync();

            return MapToResponse(trainer);
        }

        // Update an existing trainer.
        public async Task<TrainerResponseDto?> UpdateAsync(
            int id,
            UpdateTrainerDto dto)
        {
            var trainer = await _context.Trainers
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trainer == null)
            {
                return null;
            }

            trainer.FullName = dto.FullName.Trim();
            trainer.Qualifications = dto.Qualifications.Trim();
            trainer.Bio = dto.Bio?.Trim();
            trainer.Email = dto.Email?.Trim();
            trainer.PhoneNumber = dto.PhoneNumber?.Trim();
            trainer.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return MapToResponse(trainer);
        }

        // Deactivate a trainer without deleting the database record.
        public async Task<bool> DeactivateAsync(int id)
        {
            var trainer = await _context.Trainers
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trainer == null)
            {
                return false;
            }

            if (!trainer.IsActive)
            {
                return true;
            }

            trainer.IsActive = false;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<TrainerResponseDto?> GetByIdAsync(int id)
{
    var trainer = await _context.Trainers
        .AsNoTracking()
        .FirstOrDefaultAsync(t => t.Id == id);

    return trainer == null ? null : MapToResponse(trainer);
}

public async Task<bool> ActivateAsync(int id)
{
    var trainer = await _context.Trainers.FirstOrDefaultAsync(t => t.Id == id);
    if (trainer == null) return false;

    trainer.IsActive = true;
    await _context.SaveChangesAsync();
    return true;
}

        // Map the database model to the response DTO.
        private static TrainerResponseDto MapToResponse(Trainer trainer)
        {
            return new TrainerResponseDto
            {
                Id = trainer.Id,
                FullName = trainer.FullName,
                Qualifications = trainer.Qualifications,
                Bio = trainer.Bio,
                Email = trainer.Email,
                PhoneNumber = trainer.PhoneNumber,
                IsActive = trainer.IsActive
            };
        }
    }
}
