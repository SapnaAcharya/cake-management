using System.ComponentModel.DataAnnotations.Schema;

namespace CakeManagementAPI.Models
{
    public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int CakeId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }

    public int? CakeTemplateId { get; set; }

     public string? CustomizationJson { get; set; }

    // Naviagtion properties
    public Order? Order { get; set; }

    public Cake? Cake { get; set; }

    public CakeTemplate? CakeTemplate { get; set; }

        [NotMapped]
        public bool IsCustomized => CustomizationJson != null;
   }
}