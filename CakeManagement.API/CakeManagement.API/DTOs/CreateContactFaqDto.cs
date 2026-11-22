using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Contact
{
    public class CreateContactFaqDto
    {
        [Required]
        [MaxLength(300)]
        public string Question { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Answer { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }
    }
}