using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace CakeManagementAPI.DTOs.Cake
{
    public class CakeResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int StockQuantity { get; set; } 

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; }

        public string DesignType { get; set; } = "round";

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public bool IsFeatured { get; set; }

        public bool IsBestSeller { get; set; }

        public bool IsTrending { get; set; }
    }
}
