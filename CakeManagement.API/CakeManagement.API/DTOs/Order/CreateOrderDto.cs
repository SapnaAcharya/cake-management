using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;

namespace CakeManagementAPI.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        [StringLength(250)]
        public string ShippingAddress { get; set; } = string.Empty;

        // OpenStreetMap Leaflets coordinates
        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public string? PhoneNumber { get; set; } 

        [Required]
        public string PaymentMethod { get; set; } = "CashOnDelivery";

        // Used for guest checkout
        public List<CreateOrderItemDto> Items { get; set; }
             = new List<CreateOrderItemDto>();
        
    }
}
