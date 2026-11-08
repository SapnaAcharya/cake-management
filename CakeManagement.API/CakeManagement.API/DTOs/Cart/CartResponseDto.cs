//namespace CakeManagementAPI.DTOs.Cart
//{
//    public class CartResponseDto
//    {
//        public int CartId { get; set; }

//        public int UserId { get; set; }

//        public List<CartItemResponseDto> Items { get; set; }
//              = new List<CartItemResponseDto>();

//        public decimal TotalAmount { get; set; }
//    }

//    public class CartItemResponseDto
//    {
//        public int CartItemId { get; set; }

//        public int? CakeId { get; set; }

//        public string CakeName { get; set; } = string.Empty;

//        public string? ImageUrl { get; set; }
//        public decimal Price { get; set; }

//        public int Quantity { get; set; }

//        public decimal Subtotal { get; set; }

//        // Only for filled for customized cakes
//        public bool IsCustomized { get; set; }

//        public CustomizationSnapshot? Customization { get; set; }
//    }
//}


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

        public int? CakeId { get; set; }

        public string CakeName { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public decimal Subtotal { get; set; }

        // Customized cake information
        public bool IsCustomized { get; set; }

        public CustomizationSnapshot? Customization { get; set; }

        // Personalized message information
        public string? PersonalizedMessage { get; set; }

        public bool AllowMessage { get; set; }

        public string? MessageLabel { get; set; }

        public string? MessagePlaceholder { get; set; }

        public int MaxMessageLength { get; set; }

        public decimal MessageAdditionalPrice { get; set; }
    }
}
