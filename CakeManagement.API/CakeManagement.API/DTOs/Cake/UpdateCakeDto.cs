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
    }
}