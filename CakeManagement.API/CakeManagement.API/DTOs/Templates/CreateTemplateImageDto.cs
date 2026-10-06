namespace CakeManagementAPI.DTOs.Templates
{
    public class CreateTemplateImageDto
    {
        public string? Thumb { get; set; }

        public string? Preview { get; set; }

        public List<string> Gallery { get; set; } = new();

        public List<TierImageDto> TierImages { get; set; } = new();
    }
}
