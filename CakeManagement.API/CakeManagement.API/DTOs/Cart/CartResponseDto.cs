namespace CakeManagementAPI.DTOs.Cart
{
    public class CartResponseDto
    {
        public int CartId { get; set; }

        public int UserId { get; set; }

        public List<CartItemResponseDto> Items { get; set; }
              = new List<CartItemResponseDto>();

        public decimal TotalAmount { get; set; }
    }

    public class CartItemResponseDto
    {
        public int CartItemId { get; set; }

        public int CakeId { get; set; }

        public string CakeName { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public decimal Subtotal { get; set; }

        // Only for filled for customized cakes
        public bool IsCustomized { get; set; }

        public CustomizationSnapshot? Customization { get; set; }
    }
}
