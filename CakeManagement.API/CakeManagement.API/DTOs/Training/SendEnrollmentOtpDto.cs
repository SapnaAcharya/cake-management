using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class SendEnrollmentOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}