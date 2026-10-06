namespace CakeManagementAPI.DTOs.User
{
    public class UserOrderDto
    {
        public int Id { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public List<UserOrderItemDto> Items { get; set; }
             = new List<UserOrderItemDto>();
    }
}
