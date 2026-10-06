namespace CakeManagementAPI.DTOs.AdminOrder
{
    public class AdminOrderResponseDto
    {
        public int OrderId { get; set; }

        public int? UserId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerEmail { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ShippingAddress { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public List<AdminOrderItemDto> Items { get; set; }
            = new List<AdminOrderItemDto>();
    }

    public class AdminOrderItemDto
    {
        public int CakeId { get; set; }

        public string CakeName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }
    }
}