namespace CakeManagementAPI.DTOs.CakeCustomizationDecoration
{
    public class CakeCustomizationDecorationResponseDto
    {
        public int Id { get; set; }

        public int CakeCustomizationId { get; set; }

        public int DecorationId { get; set; }

        public string DecorationName { get; set; } = null!;

        public string? ImageUrl { get; set; }

        public decimal PositionX { get; set; }

        public decimal PositionY { get; set; }

        public decimal Scale { get; set; }

        public decimal Rotation { get; set; }

        public int Layer { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public decimal TotalPrice { get; set; }
    }
}
