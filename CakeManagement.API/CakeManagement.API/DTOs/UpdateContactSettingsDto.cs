
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Contact
{
    public class UpdateContactSettingsDto
    {
        [Required]
        [StringLength(100)]
        public string HeroTitle { get; set; } = string.Empty;

        [StringLength(500)]
        public string HeroText { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(30)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; } = string.Empty;

        [StringLength(200)]
        public string Hours { get; set; } = string.Empty;

        [StringLength(500)]
        public string EmailNote { get; set; } = string.Empty;

        [Required]
        [StringLength(300)]
        public string Address { get; set; } = string.Empty;

        [Range(-90, 90)]
        public double Latitude { get; set; }

        [Range(-180, 180)]
        public double Longitude { get; set; }

        [Url]
        public string? WhatsApp { get; set; }

        [Url]
        public string? Instagram { get; set; }

        [Url]
        public string? Facebook { get; set; }

        public List<string> Subjects { get; set; } = new();
    }
}
