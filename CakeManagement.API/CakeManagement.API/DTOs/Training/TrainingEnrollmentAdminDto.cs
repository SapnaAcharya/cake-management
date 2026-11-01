namespace CakeManagementAPI.DTOs.Training
{
    public class TrainingEnrollmentAdminDto
    {
        public int Id { get; set; }

        // Customer information
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string? WhatsApp { get; set; }
        public string? City { get; set; }
        public string ExperienceLevel { get; set; } = "";

        // Training package information
        public int TrainingId { get; set; }
        public string TrainingPackageName { get; set; } = "";

        // Selected batch information
        public int TrainingBatchId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ScheduleDetails { get; set; } = "";

        // Enrollment information
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}