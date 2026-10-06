using System.Text.Json.Serialization;

namespace CakeManagementAPI.Models
{
    public class CakeTemplateImage
    {
        public int Id { get; set; }

        public int CakeTemplateId { get; set; }

        [JsonIgnore]
        public CakeTemplate? CakeTemplate { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        public int? TierCount { get; set; }
        public string ImageType { get; set; } = string.Empty;
    }
}
