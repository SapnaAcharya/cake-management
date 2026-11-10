
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class UpdateTrainingBatchDto
    {
        [Range(1, int.MaxValue)]
        public int TrainingPackageId { get; set; }

        [Range(1, int.MaxValue)]
        public int TrainerId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [StringLength(1000)]
        public string ScheduleDetails { get; set; } = string.Empty;

        [Range(1, 500)]
        public int Capacity { get; set; }

        [Required]
        [RegularExpression("^(Open|Closed|Full|Cancelled)$",
            ErrorMessage = "Status must be Open, Closed, Full, or Cancelled.")]
        public string Status { get; set; } = "Open";
    }
}
