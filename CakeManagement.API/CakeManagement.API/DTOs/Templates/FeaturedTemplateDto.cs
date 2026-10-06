using CakeManagementAPI.DTOs.Templates;
public class FeaturedTemplateDto
{
    public int Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public decimal BasePrice { get; set; }

    public string Category { get; set; }

    public string? ImageUrl { get; set; }              // the thumb, for simple use
    public List<TemplateImageDto> Images { get; set; } = new();
}