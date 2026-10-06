
using System.ComponentModel.DataAnnotations;
public class CustomizationDecorationDto
{
    public int DecorationId { get; set; }

    [Range(1, 50)]
    public int Quantity { get; set; } = 1;
}