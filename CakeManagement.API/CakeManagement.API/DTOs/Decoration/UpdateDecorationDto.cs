namespace CakeManagementAPI.DTOs.Decoration
{
    public class UpdateDecorationDto
    {
        public string Name { get; set; } = null!;

        public string? Category { get; set; }

        public string? ImageUrl { get; set; }

        public decimal Price { get; set; }

        public string? Occasion { get; set; }

        public bool IsActive { get; set; }
    }
}
