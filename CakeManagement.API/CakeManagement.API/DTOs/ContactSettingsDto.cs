namespace CakeManagementAPI.DTOs.Contact
{
    public class ContactSettingsDto
    {
        public string HeroTitle { get; set; } = string.Empty;
        public string HeroText { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Hours { get; set; } = string.Empty;
        public string EmailNote { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string? WhatsApp { get; set; }
        public string? Instagram { get; set; }
        public string? Facebook { get; set; }

        public List<string> Subjects { get; set; } = new();
        public List<ContactFaqDto> Faqs { get; set; } = new();
    }
}