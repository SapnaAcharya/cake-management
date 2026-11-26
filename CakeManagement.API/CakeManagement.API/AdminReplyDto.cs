using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Contact
{
    public class AdminReplyDto
    {
        [Required]
        [StringLength(5000)]
        public string ReplyMessage { get; set; } = string.Empty;
    }
}