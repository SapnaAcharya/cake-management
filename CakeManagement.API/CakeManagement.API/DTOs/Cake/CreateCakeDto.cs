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
    }
}