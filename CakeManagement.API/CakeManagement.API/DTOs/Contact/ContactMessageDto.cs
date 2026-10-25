using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Contact
{
    public class ContactMessageDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [StringLength(5000, MinimumLength = 5)]
        public string Message { get; set; } = string.Empty;
    }
}

