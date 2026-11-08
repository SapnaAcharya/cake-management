using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cart
{
    public class UpdatePersonalizedMessageDto
    {
        [StringLength(500)]
        public string? PersonalizedMessage { get; set; }
    }
}
