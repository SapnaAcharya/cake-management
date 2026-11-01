
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class VerifyTrainingEnrollmentDto
    {
        [Required]
        public int TrainingId { get; set; }

        [Required]
        public int TrainingBatchId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public string? WhatsApp { get; set; }

        public string? City { get; set; }

        public string? ExperienceLevel { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Otp { get; set; } = string.Empty;
    }
}
