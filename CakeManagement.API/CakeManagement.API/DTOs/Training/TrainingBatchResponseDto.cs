
namespace CakeManagementAPI.DTOs.Training
{
    public class TrainingBatchResponseDto
    {
        public int Id { get; set; }

        public int TrainingPackageId { get; set; }
        public string TrainingPackageName { get; set; } = string.Empty;

        public int TrainerId { get; set; }
        public string TrainerName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string ScheduleDetails { get; set; } = string.Empty;

        public int Capacity { get; set; }
        public int RegisteredCount { get; set; }

        public string Status { get; set; } = "Open";
    }
}
