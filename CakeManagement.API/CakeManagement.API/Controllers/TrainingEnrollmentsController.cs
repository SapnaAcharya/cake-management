using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/training")]
    public class TrainingEnrollmentsController : ControllerBase
    {
        private readonly TrainingEnrollmentService _enrollmentService;
        private readonly EnrollmentEmailVerificationService _verificationService;
        private readonly AppDbContext _context;
        private readonly ILogger<TrainingEnrollmentsController> _logger;

        public TrainingEnrollmentsController(
            TrainingEnrollmentService enrollmentService,
            EnrollmentEmailVerificationService verificationService,
            AppDbContext context,
            ILogger<TrainingEnrollmentsController> logger)
        {
            _enrollmentService = enrollmentService;
            _verificationService = verificationService;
            _context = context;
            _logger = logger;
        }

        // STEP 1: Send OTP to customer's email
        [HttpPost("send-enrollment-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendEnrollmentOtp(
            [FromBody] SendEnrollmentOtpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _verificationService.SendCodeAsync(dto.Email);

                return Ok(new
                {
                    message = "Verification code sent successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send training enrollment OTP.");

                return StatusCode(500, new
                {
                    message = "Unable to send verification code."
                });
            }
        }

        // STEP 2: Verify OTP and generate verification token
        [HttpPost("verify-enrollment-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEnrollmentEmail(
            [FromBody] VerifyEnrollmentEmailDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var verificationToken =
                    await _verificationService.VerifyAndCreateTokenAsync(
                        dto.Email,
                        dto.Otp);

                if (verificationToken == null)
                {
                    return BadRequest(new
                    {
                        message = "Invalid or expired verification code."
                    });
                }

                return Ok(new
                {
                    message = "Email verified successfully.",
                    verificationToken = verificationToken
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Training enrollment email verification failed.");

                return StatusCode(500, new
                {
                    message = "Unable to verify email."
                });
            }
        }

        // STEP 3: Create enrollment using verification token
        [HttpPost("enroll")]
        [AllowAnonymous]
        public async Task<IActionResult> Enroll(
            [FromBody] EnrollmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Validate and consume verification token
                var tokenIsValid =
                    await _verificationService.ConsumeVerificationTokenAsync(
                        dto.Email,
                        dto.VerificationToken);

                if (!tokenIsValid)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message = "Email verification is required or the verification token has expired."
                    });
                }

                // 2. Prepare customer enrollment
                var enrollment = new TrainingEnrollment
                {
                    TrainingId = dto.TrainingId,
                    TrainingBatchId = dto.TrainingBatchId,
                    Name = dto.Name.Trim(),
                    Email = dto.Email.Trim().ToLowerInvariant(),
                    Phone = dto.Phone.Trim(),
                    WhatsApp = dto.WhatsApp?.Trim(),
                    City = dto.City?.Trim(),

                    ExperienceLevel =
                        string.IsNullOrWhiteSpace(dto.ExperienceLevel)
                            ? "Beginner"
                            : dto.ExperienceLevel.Trim()
                };

                // 3. Create enrollment using existing business rules
                var result =
                    await _enrollmentService.CreateAsync(enrollment);

                // 4. Commit database transaction
                await transaction.CommitAsync();

                // 5. Send confirmation email after successful commit
                await _enrollmentService.SendConfirmationEmailAsync(
                    result.Id);

                return Ok(new
                {
                    message = "Enrollment confirmed successfully.",
                    id = result.Id,
                    trainingId = result.TrainingId,
                    batchId = result.TrainingBatchId,
                    name = result.Name,
                    email = result.Email,
                    status = result.Status
                });
            }
            catch (ArgumentException ex)
            {
                await transaction.RollbackAsync();

                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                _logger.LogError(
                    ex,
                    "Training enrollment failed.");

                return StatusCode(500, new
                {
                    message = "An error occurred while processing your enrollment."
                });
            }
        }

        // ADMIN: Get all customer training enrollments
        [HttpGet("enrollments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllEnrollments()
        {
            try
            {
                var enrollments =
                    await _enrollmentService.GetAllEnrollmentsAsync();

                return Ok(enrollments);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to retrieve training enrollments.");

                return StatusCode(500, new
                {
                    message = "Unable to retrieve training enrollments."
                });
            }
        }

        // ADMIN: Get one enrollment by ID
        [HttpGet("enrollments/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetEnrollmentById(int id)
        {
            try
            {
                var enrollment =
                    await _enrollmentService.GetEnrollmentByIdAsync(id);

                if (enrollment == null)
                {
                    return NotFound(new
                    {
                        message = "Training enrollment not found."
                    });
                }

                return Ok(enrollment);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to retrieve training enrollment {EnrollmentId}",
                    id);

                return StatusCode(500, new
                {
                    message = "Unable to retrieve this training enrollment."
                });
            }
        }
    }
}


