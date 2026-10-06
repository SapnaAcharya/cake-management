using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cart
{
    public class AddToCartDto
    {
        [Required]
        public int CakeId { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; } = 1;

        // Only sent for a customized cake. Null for normal cake
        public CustomizationDto? Customization { get; set; }
    }
}
