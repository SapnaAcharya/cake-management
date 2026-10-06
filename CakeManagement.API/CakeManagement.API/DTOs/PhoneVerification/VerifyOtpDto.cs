using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.PhoneVerification
{
    public class VerifyOtpDto
    {
        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Otp { get; set; } = string.Empty;
    }
}
