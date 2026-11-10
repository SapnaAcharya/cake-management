
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class CreateTrainingPackageDto
    {
        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Beginner|Intermediate|Advanced)$")]
        public string SkillLevel { get; set; } = "Beginner";

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string LearningOutcomes { get; set; } = string.Empty;

        [Range(1, 365)]
        public int DurationInDays { get; set; } = 30;

        [Range(typeof(decimal), "0", "10000000")]
        public decimal Fee { get; set; }

        public IFormFile? Image { get; set; }
    }
}
