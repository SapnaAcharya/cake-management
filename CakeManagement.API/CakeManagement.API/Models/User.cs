namespace CakeManagementAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Customer";

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // A customer can have one cart
        public Cart? Cart { get; set; }

        // A customer can have many orders
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
