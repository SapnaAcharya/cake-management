using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cart
{
    // What the customize page sends
    public class CustomizationDto
    {
        [Required]
        public int CakeId { get; set; }

        [Required]
        public int TemplateId { get; set; }

        public int? Size { get; set; }               // inches: 6 / 8 / 10

        [Range(1, 3)]
        public int Tiers { get; set; } = 1;

        public int? ColorId { get; set; }

        [MaxLength(200)]
        public string? Message { get; set; }

        [MaxLength(50)]
        public string? Font { get; set; }

        [MaxLength(50)]
        public string? Sponge { get; set; }

        [MaxLength(50)]
        public string? Frosting { get; set; }

        [Range(0, 100)]
        public int Candles { get; set; }

        public bool Lit { get; set; }

        public List<CustomizationDecorationDto> Decorations { get; set; } = new();
    }
}
    
