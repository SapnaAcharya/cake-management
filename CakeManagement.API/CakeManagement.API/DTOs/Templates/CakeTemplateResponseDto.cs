using CakeManagementAPI.DTOs.Templates;

public class CakeTemplateResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public bool IsPopular { get; set; }

    public int Tiers { get; set; }

    public decimal BasePrice { get; set; }

    public int MinPrepHours { get; set; }

    public int MaxPrepHours { get; set; }

    public List<int> Sizes { get; set; } = new();

    public List<CakeTemplateColorDto> Colors { get; set; } = new();

    public List<string> Features { get; set; } = new();

    public List<CakeTemplateImageResponseDto> ImageUrls { get; set; } = new();
}