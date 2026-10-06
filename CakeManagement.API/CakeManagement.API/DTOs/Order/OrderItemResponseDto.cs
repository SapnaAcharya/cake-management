using CakeManagementAPI.DTOs.Cart;

namespace CakeManagementAPI.DTOs.Order
{
    public class OrderItemResponseDto
    {
        public int OrderItemId { get; set; }

        public int CakeId { get; set; }

        public string CakeName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }

        // Only filled for customized cakes
        public bool IsCustomized { get; set; }

        public CustomizationSnapshot? Customization { get; set; }

    }
}
