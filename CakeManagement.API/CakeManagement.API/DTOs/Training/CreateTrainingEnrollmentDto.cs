using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class CreateTrainingEnrollmentDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int TrainingId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int TrainingBatchId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = "";

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; } = "";

        [Required]
        [RegularExpression(
            @"^\+?[0-9][0-9\-]{6,18}$",
            ErrorMessage = "Enter a valid phone number."
        )]
        public string Phone { get; set; } = "";

        [RegularExpression(
            @"^\+?[0-9][0-9\-]{6,18}$",
            ErrorMessage = "Enter a valid WhatsApp number."
        )]
        public string? WhatsApp { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [Required]
        [RegularExpression(
            "^(Beginner|Intermediate|Advanced)$",
            ErrorMessage = "Experience level is not valid."
        )]
        public string ExperienceLevel { get; set; } = "Beginner";
    }
}
