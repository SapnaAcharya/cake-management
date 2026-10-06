namespace CakeManagementAPI.Models
{
    public class CakeTemplateColor
    {
        public int Id { get; set; }

        public int CakeTemplateId { get; set; }

        public CakeTemplate? CakeTemplate { get; set; }

        public string ColorName { get; set; } = string.Empty;

        public string ColorHex { get; set; } = string.Empty;
    }
}
