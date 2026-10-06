using System.ComponentModel.DataAnnotations;
namespace CakeManagementAPI.Models
{
    public class Decoration
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public String Name { get; set; } = null!;

        [MaxLength(100)]
        public string? Category { get; set; }

        public string? ImageUrl { get; set; }

        [Range(0, 999999)]
        public decimal Price { get; set; }

        public string? Occasion { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
