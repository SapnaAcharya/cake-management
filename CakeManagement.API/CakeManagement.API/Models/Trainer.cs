namespace CakeManagementAPI.Models
{
    public class Trainer
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Qualifications { get; set; } = string.Empty;

        public string? Bio { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<TrainingBatch> Batches { get; set; }
            = new List<TrainingBatch>();
    }
}