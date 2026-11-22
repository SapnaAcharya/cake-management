
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Contact
{
    public class UpdateContactMessageStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
