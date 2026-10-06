using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.AdminOrder
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
