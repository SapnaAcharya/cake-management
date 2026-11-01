using CakeManagementAPI.Data;
using CakeManagementAPI.Models;
using Microsoft.EntityFrameworkCore;
using CakeManagementAPI.DTOs.Training;

namespace CakeManagementAPI.Services
{
    public class TrainingEnrollmentService
    {
        private readonly AppDbContext _context;

        public TrainingEnrollmentService(AppDbContext context)
        {
            _context = context;
        }

        // ============================================
        // CREATE CUSTOMER TRAINING ENROLLMENT
        // ============================================

        public async Task<TrainingEnrollment> CreateAsync(
            TrainingEnrollment enrollment)
        {
            // 1. Find active training package
            var package = await _context.TrainingPackages
                .FirstOrDefaultAsync(p =>
                    p.Id == enrollment.TrainingId &&
                    p.IsActive);

            if (package == null)
            {
                throw new ArgumentException(
                    "Training package not found or inactive.");
            }

            // 2. Find selected batch belonging to this package
            var batch = await _context.TrainingBatches
                .FirstOrDefaultAsync(b =>
                    b.Id == enrollment.TrainingBatchId &&
                    b.TrainingPackageId == enrollment.TrainingId);

            if (batch == null)
            {
                throw new ArgumentException(
                    "Selected training batch does not belong to this course.");
            }

            // 3. Check batch status
            if (!string.Equals(
                batch.Status,
                "Open",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "This training batch is not open for enrollment.");
            }

            // 4. Normalize customer details
            enrollment.Name = enrollment.Name.Trim();
            enrollment.Email = enrollment.Email.Trim().ToLowerInvariant();
            enrollment.Phone = enrollment.Phone.Trim();
            enrollment.WhatsApp = enrollment.WhatsApp?.Trim();
            enrollment.City = enrollment.City?.Trim();

            // 5. Check duplicate enrollment
            var duplicate = await _context.TrainingEnrollments
                .AnyAsync(e =>
                    e.TrainingBatchId == enrollment.TrainingBatchId &&
                    e.Email == enrollment.Email);

            if (duplicate)
            {
                throw new InvalidOperationException(
                    "You have already enrolled in this training batch.");
            }

            // 6. Count confirmed enrollments
            var enrolledCount = await _context.TrainingEnrollments
                .CountAsync(e =>
                    e.TrainingBatchId == enrollment.TrainingBatchId &&
                    e.Status == "Confirmed");

            // 7. Check available seats
            if (enrolledCount >= batch.Capacity)
            {
                throw new InvalidOperationException(
                    "Sorry, this training batch is full.");
            }

            // 8. Create enrollment without email verification
            enrollment.Status = "Confirmed";
            enrollment.CreatedAt = DateTime.UtcNow;
            enrollment.TrainingBatch = batch;

            _context.TrainingEnrollments.Add(enrollment);

            // 9. Save enrollment to database
            await _context.SaveChangesAsync();

            return enrollment;
        }

        // ============================================
        // GET ALL CUSTOMER TRAINING ENROLLMENTS
        // ADMIN
        // ============================================

        public async Task<List<TrainingEnrollmentAdminDto>>
            GetAllEnrollmentsAsync()
        {
            return await _context.TrainingEnrollments
                .AsNoTracking()
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new TrainingEnrollmentAdminDto
                {
                    Id = e.Id,

                    // Customer details
                    Name = e.Name,
                    Email = e.Email,
                    Phone = e.Phone,
                    WhatsApp = e.WhatsApp,
                    City = e.City,
                    ExperienceLevel = e.ExperienceLevel,

                    // Training package details
                    TrainingId = e.TrainingId,
                    TrainingPackageName =
                        e.TrainingBatch!.TrainingPackage.Name,

                    // Selected batch details
                    TrainingBatchId = e.TrainingBatchId,
                    StartDate = e.TrainingBatch.StartDate,
                    EndDate = e.TrainingBatch.EndDate,
                    ScheduleDetails =
                        e.TrainingBatch.ScheduleDetails,

                    // Enrollment details
                    Status = e.Status,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();
        }

        // ============================================
        // GET CUSTOMER ENROLLMENT BY ID
        // ADMIN
        // ============================================

        public async Task<TrainingEnrollmentAdminDto?>
            GetEnrollmentByIdAsync(int id)
        {
            return await _context.TrainingEnrollments
                .AsNoTracking()
                .Where(e => e.Id == id)
                .Select(e => new TrainingEnrollmentAdminDto
                {
                    Id = e.Id,

                    // Customer details
                    Name = e.Name,
                    Email = e.Email,
                    Phone = e.Phone,
                    WhatsApp = e.WhatsApp,
                    City = e.City,
                    ExperienceLevel = e.ExperienceLevel,

                    // Training package details
                    TrainingId = e.TrainingId,
                    TrainingPackageName =
                        e.TrainingBatch!.TrainingPackage.Name,

                    // Selected batch details
                    TrainingBatchId = e.TrainingBatchId,
                    StartDate = e.TrainingBatch.StartDate,
                    EndDate = e.TrainingBatch.EndDate,
                    ScheduleDetails =
                        e.TrainingBatch.ScheduleDetails,

                    // Enrollment details
                    Status = e.Status,
                    CreatedAt = e.CreatedAt
                })
                .FirstOrDefaultAsync();
        }
    }
}



