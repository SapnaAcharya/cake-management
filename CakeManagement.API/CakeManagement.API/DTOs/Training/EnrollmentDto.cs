using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class EnrollmentDto
    {
        [Required] public int TrainingId { get; set; }
        [Required] public int TrainingBatchId { get; set; }
        [Required, StringLength(100)] public string Name { get; set; } = "";
        [Required, EmailAddress] public string Email { get; set; } = "";
        [Required, StringLength(20)] public string Phone { get; set; } = "";
        public string? WhatsApp { get; set; }
        public string? City { get; set; }
        public string? ExperienceLevel { get; set; }
    }
}