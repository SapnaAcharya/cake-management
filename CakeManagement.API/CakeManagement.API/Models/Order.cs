namespace CakeManagementAPI.Models
{
    public class Order
    {
        public int Id { get; set; }
        
        // Nullable because guest orders don't have a registered user
        public int? UserId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Pending";

        // Customer/guest contact number and details
        public string? CustomerName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? ShippingAddress { get; set; }

        public string PaymentMethod { get; set; } = "CashOnDelivery";

        public string PaymentStatus { get; set; } = "Pending";

        // Navigation properties
        public User? User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; }
              = new List<OrderItem>();
    }
}