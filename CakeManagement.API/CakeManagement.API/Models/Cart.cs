namespace CakeManagementAPI.Models
{
    public class Cart
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // One cart belongs to one user
        public User? User { get; set; }

        // One cart can contain many items
        public ICollection<CartItem> CartItems { get; set; }
              = new List<CartItem>();
    }
}
