using CakeManagementAPI.DTOs.Templates;
public class CakeTemplateBaseDto
{
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
}