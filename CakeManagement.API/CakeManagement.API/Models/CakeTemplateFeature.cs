namespace CakeManagementAPI.Models
{
    public class CakeTemplateFeature
    {
        public int Id { get; set; }

        public int CakeTemplateId { get; set; }

        public CakeTemplate? CakeTemplate { get; set; }

        public string FeatureName { get; set; } = string.Empty;
    }
}
