using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        [StringLength(250)]
        public string ShippingAddress { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; } 

        [Required]
        public string PaymentMethod { get; set; } = "CashOnDelivery";

        // Used for guest checkout
        public List<CreateOrderItemDto> Items { get; set; }
             = new List<CreateOrderItemDto>();
        
    }
}
