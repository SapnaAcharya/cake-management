using CakeManagementAPI.Models;

public class TrainingEnrollment
{
    public int Id { get; set; }
    public int TrainingId { get; set; }

    // Selected training batch
    public int TrainingBatchId { get; set; }

    public TrainingBatch? TrainingBatch { get; set; }

    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? WhatsApp { get; set; }
    public string? City { get; set; }
    public string ExperienceLevel { get; set; } = "Beginner";

    // Enrollment status
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}