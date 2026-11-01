namespace CakeManagementAPI.Models
{
    public class TrainingPackage
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string SkillLevel { get; set; } = "Beginner";

        public string Description { get; set; } = string.Empty;

        public string LearningOutcomes { get; set; } = string.Empty;

        public int DurationInDays { get; set; } = 30;

        public decimal Fee { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAtUtc { get; set; } =
            DateTime.UtcNow;

        public ICollection<TrainingBatch> Batches { get; set; }
            = new List<TrainingBatch>();
    }
}