namespace CakeManagementAPI.DTOs.Templates
{
    public class CakeTemplateImageResponseDto
    {
        public string ImageUrl { get; set; } = string.Empty;

        public int? TierCount { get; set; }

        public string ImageType { get; set; } = string.Empty;
    }
}
