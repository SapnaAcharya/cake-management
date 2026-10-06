namespace CakeManagementAPI.Models
{
    public class CakeTemplateSize
    {
        public int Id { get; set; }

        public int CakeTemplateId { get; set; }

        public CakeTemplate? CakeTemplate { get; set; }

        public int SizeInInches { get; set; }
        
    }
}
