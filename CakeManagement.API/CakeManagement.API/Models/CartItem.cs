using System.ComponentModel.DataAnnotations.Schema;

namespace CakeManagementAPI.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        public int CartId { get; set; }

        public int CakeId { get; set; }

        public int Quantity { get; set; } = 1;

        public int? CakeTemplateId { get; set; }

        public decimal? CustomUnitPrice { get; set; }

        public string? CustomizationJson { get; set; }

        // Navigation properties
        public Cart? Cart { get; set; }

        public Cake? Cake { get; set; }  
        
        public CakeTemplate? CakeTemplate { get; set; }

        [NotMapped]
        public bool IsCustomized => CustomizationJson != null;
    }
}
