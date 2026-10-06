namespace CakeManagementAPI.DTOs.User
{
    public class UserOrderItemDto
    {
        public int CakeId { get; set; }

        public string CakeName { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }
    }
}
