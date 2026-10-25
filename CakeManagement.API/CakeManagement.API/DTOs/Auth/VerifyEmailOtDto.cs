using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Auth
{
    public class VerifyEmailOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{6}$",
            ErrorMessage = "The verification code must contain 6 digits.")]
        public string Otp { get; set; } = string.Empty;
    }
}
