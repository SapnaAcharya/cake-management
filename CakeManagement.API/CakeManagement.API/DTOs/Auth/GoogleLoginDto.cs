using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Auth
{
    public class GoogleLoginDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
