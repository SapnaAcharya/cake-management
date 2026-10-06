using Microsoft.Identity.Client;

namespace CakeManagementAPI.DTOs.Templates
{
    public class TemplateImageDto
    {
        public string ImageType { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public int? TierCount { get; set; }
    }
}
