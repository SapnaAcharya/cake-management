namespace CakeManagementAPI.DTOs.CakeCustomizationDecoration
{
    public class AddCakeCustomizationDecorationDto
        {
            public int DecorationId { get; set; }

            public decimal PositionX { get; set; }

           public decimal PositionY { get; set; }

        public decimal Scale { get; set; } = 1;

            public decimal Rotation { get; set; }

            public int Layer { get; set; }

        public int Quantity { get; set; } = 1;
    }
}
