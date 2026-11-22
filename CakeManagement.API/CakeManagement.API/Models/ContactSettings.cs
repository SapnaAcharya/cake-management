namespace CakeManagementAPI.Models
{
    public class ContactSettings
    {
        public int Id { get; set; }

        // Hero Section
        public string HeroTitle { get; set; } = "Contact Us";
        public string HeroText { get; set; } = string.Empty;

        // Contact Information
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Hours { get; set; } = string.Empty;
        public string EmailNote { get; set; } = string.Empty;

        // Location
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Social Media
        public string? WhatsApp { get; set; }
        public string? Instagram { get; set; }
        public string? Facebook { get; set; }

        // Enquiry Subjects
        public string SubjectsJson { get; set; } = "[]";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}