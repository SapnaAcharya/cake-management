namespace CakeManagementAPI.Models
{
    public class TrainingBatch
    {
        public int Id { get; set; }

        public int TrainingPackageId { get; set; }

        public TrainingPackage TrainingPackage { get; set; }
            = null!;

        public int TrainerId { get; set; }

        public Trainer Trainer { get; set; } = null!;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string ScheduleDetails { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public string Status { get; set; } = "Open";

    }
}