using System.Data.SqlTypes;

namespace CakeManagementAPI.Models
{
    public class Cake
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        // SEO-Friendly URL identifier
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;

        public string DesignType { get; set; } = "round";

        public bool IsFeatured { get; set; } = false;

        public bool IsBestSeller { get; set; } = false;

        public bool IsTrending { get; set; } = false;

        public bool AllowMessage { get; set; } = false;

        public string MessageLabel { get; set; } = "Personalized Message";

        public string MessagePlaceholder { get; set; } = "Enter your message";

        public int MaxMessageLength { get; set; } = 100;

        public decimal MessageAdditionalPrice { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Foreign key
        public int CategoryId { get; set; }

        // Navigation property
        public Category? Category { get; set; }

        // Navigation properties
        public ICollection<CartItem> CartItems { get; set; }
               = new List<CartItem>();

        public ICollection<OrderItem> OrderItems { get; set; }
               = new List<OrderItem>();
    }
}
