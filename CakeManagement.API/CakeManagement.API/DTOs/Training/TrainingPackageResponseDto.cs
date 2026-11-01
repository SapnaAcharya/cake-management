
namespace CakeManagementAPI.DTOs.Training
{
    public class TrainingPackageResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string SkillLevel { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string LearningOutcomes { get; set; } = string.Empty;

        public int DurationInDays { get; set; }

        public decimal Fee { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; }
    }
}
