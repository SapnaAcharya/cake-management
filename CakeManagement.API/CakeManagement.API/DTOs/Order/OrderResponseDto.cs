using CakeManagementAPI.DTOs.Order;

namespace CakeManagement.DTOs.Order
{
    public class OrderResponseDto
    {
        public int OrderId { get; set; }

        // Null for guest orders
        public int? UserId { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ShippingAddress { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public List<OrderItemResponseDto> Items { get; set; }
              = new List<OrderItemResponseDto>();
    }
}