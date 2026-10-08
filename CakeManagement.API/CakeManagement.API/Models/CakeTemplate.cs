using System.ComponentModel.DataAnnotations.Schema;

namespace CakeManagementAPI.Models
{
    public class CakeTemplate
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public bool IsPopular { get; set; }

        public int Tiers { get; set; }

        [Column(TypeName = "decimal(10,2")]
        public decimal BasePrice { get; set; }

        public int MinPrepHours { get; set; }

        public int MaxPrepHours { get; set; }

        public DateTime CreatedAt { get; set; }

        // one-to-many entity and TemplateColor.
        public ICollection<CakeTemplateImage>? Images { get; set; }

        public ICollection<CakeTemplateSize>? Sizes { get; set; }

        public ICollection<CakeTemplateColor>? Colors { get; set; }

        public ICollection<CakeTemplateFeature>? Features { get; set; }

    }
}
