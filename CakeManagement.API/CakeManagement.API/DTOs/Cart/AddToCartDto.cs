using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cart
{
    public class AddToCartDto
    {
        
        // Required for a normal cake. Null for a customized cake
        // (a customized cake is identified by Customization.TemplateId).
        // The "one of the two is required" rule is checked in CartService.
        public int? CakeId { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; } = 1;

        // Only sent for a customized cake. Null for normal cake
        public CustomizationDto? Customization { get; set; }
    }
}
