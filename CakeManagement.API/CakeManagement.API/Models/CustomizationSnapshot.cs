using CakeManagementAPI.DTOs.Cart;
using CakeManagementAPI.Models;

public class CustomizationSnapshot
{
    public int CakeId { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int? Size { get; set; }
    public int Tiers { get; set; }

    public int? ColorId { get; set; }
    public string? ColorName { get; set; }
    public string? ColorHex { get; set; }
    public string? Message { get; set; }
    public string? Font { get; set; }
    public string? Sponge { get; set; }
    public string? Frosting { get; set; }
    public int Candles { get; set; }
    public bool Lit { get; set; }
    public List<SnapshotDecoration> Decorations { get; set; } = new();

    public static CustomizationSnapshot? FromJson(string? json) =>
        string.IsNullOrWhiteSpace(json)
            ? null
            : System.Text.Json.JsonSerializer.Deserialize<CustomizationSnapshot>(json);
}

