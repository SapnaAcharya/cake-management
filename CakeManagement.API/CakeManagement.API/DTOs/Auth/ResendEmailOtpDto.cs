using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Auth
{
    public class ResendEmailOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
