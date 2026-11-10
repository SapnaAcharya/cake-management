using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cake
{
    public class CreateCakeDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, 1000000,
            ErrorMessage ="Price must be greater than 0")]
        public decimal Price { get; set; }

        [Range(0,
            int.MaxValue,
            ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; }

        //public string ImageUrl { get; set; } = string.Empty;
        public IFormFile? Image { get; set; } 

        public bool IsAvailable { get; set; } = true;

        public string DesignType { get; set; } = "round";

        [Range(1, int.MaxValue,
            ErrorMessage = "A valid category is required")]
        public int CategoryId { get; set; }

        public bool IsFeatured { get; set; }

        public bool IsBestSeller { get; set; }

        public bool IsTrending { get; set; }

        // Personalized Cake Message Settings
        public bool AllowMessage { get; set; } = false;

        [StringLength(100,
            ErrorMessage = "Message label cannot exceed 100 characters")]
        public string MessageLabel { get; set; } = "Personalized Message";

        [StringLength(200,
            ErrorMessage = "Message placeholder cannot exceed 200 characters")]
        public string MessagePlaceholder { get; set; } = "Enter your message..";

        [Range(1, 500,
            ErrorMessage = "Maximum message length must be between 1 and 500")]
        public int MaxMessageLength { get; set; } = 100;

        [Range(0, 100000,
            ErrorMessage = "Message additional price cannot be negative or exceed 100000")]
        public decimal MessageAdditionalPrice { get; set; } = 0;
    }
}