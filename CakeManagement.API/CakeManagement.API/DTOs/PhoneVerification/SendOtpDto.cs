using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.PhoneVerification
{
    public class SendOtpDto
    {
        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
