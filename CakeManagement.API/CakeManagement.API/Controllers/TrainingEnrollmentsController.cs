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
        private readonly ILogger<TrainingEnrollmentsController> _logger;

        public TrainingEnrollmentsController(
            TrainingEnrollmentService enrollmentService,
            ILogger<TrainingEnrollmentsController> logger)
        {
            _enrollmentService = enrollmentService;
            _logger = logger;
        }

        // ============================================
        // CUSTOMER: ENROLL IN TRAINING
        // ============================================

        [HttpPost("enroll")]
        [AllowAnonymous]
        public async Task<IActionResult> Enroll(
            [FromBody] EnrollmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var enrollment = new TrainingEnrollment
                {
                    TrainingId = dto.TrainingId,
                    TrainingBatchId = dto.TrainingBatchId,
                    Name = dto.Name,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    WhatsApp = dto.WhatsApp,
                    City = dto.City,
                    ExperienceLevel = string.IsNullOrWhiteSpace(
                        dto.ExperienceLevel)
                            ? "Beginner"
                            : dto.ExperienceLevel
                };

                var result = await _enrollmentService.CreateAsync(
                    enrollment);

                _logger.LogInformation(
                    "Training enrollment created successfully. Enrollment ID: {EnrollmentId}",
                    result.Id);

                return Ok(new
                {
                    success = true,
                    message = "Training enrollment submitted successfully.",
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
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error occurred while creating training enrollment.");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        success = false,
                        message = "An error occurred while submitting your enrollment."
                    });
            }
        }

        // ============================================
        // ADMIN: GET ALL ENROLLMENTS
        // ============================================

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
                    "Error occurred while retrieving training enrollments.");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Unable to retrieve training enrollments."
                    });
            }
        }

        // ============================================
        // ADMIN: GET ENROLLMENT BY ID
        // ============================================

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
                    "Error occurred while retrieving enrollment ID: {EnrollmentId}",
                    id);

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Unable to retrieve the training enrollment."
                    });
            }
        }
    }
}