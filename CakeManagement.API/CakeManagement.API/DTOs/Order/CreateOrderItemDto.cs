using CakeManagementAPI.DTOs.Cart;
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Order
{
    public class CreateOrderItemDto
    {
        [Required]
        public int CakeId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        // Only fro customized cakes in a guest checkout. Null = normal cake.
        public CustomizationDto? Customization { get; set; }
    }
}
