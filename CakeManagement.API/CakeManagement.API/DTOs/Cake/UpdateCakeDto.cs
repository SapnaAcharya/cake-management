using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cake
{
    public class UpdateCakeDto
    {
        [Required(ErrorMessage = "Cake name is required")]
        [StringLength(100, MinimumLength = 2,
            ErrorMessage = "Cake name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000,
            ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, 1000000,
            ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Range(0,
            int.MaxValue,
            ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; }
        public IFormFile? Image { get; set; }

        public bool IsAvailable { get; set; }

        public string DesignType { get; set; } = string.Empty;

        [Range(1, int.MaxValue,
            ErrorMessage = "A valid category is required")]
        public int CategoryId { get; set; }

        public bool IsFeatured { get; set; }

        public bool IsBestSeller { get; set; }

        public bool IsTrending { get; set; }

        // Personalized Cake Message Settings
        public bool? AllowMessage { get; set; }

        [StringLength(100,
            ErrorMessage = "Message label cannot exceed 100 characters")]
        public string? MessageLabel { get; set; } 

        [StringLength(200,
            ErrorMessage = "Message placeholder cannot exceed 200 characters")]
        public string? MessagePlaceholder { get; set; } 

        [Range(1, 500,
            ErrorMessage = "Maximum message length must be between 1 and 500")]
        public int? MaxMessageLength { get; set; } 

        [Range(0, 100000,
            ErrorMessage = "Message additional price cannot be negative or exceed 100000")]
        public decimal? MessageAdditionalPrice { get; set; }

       }
}