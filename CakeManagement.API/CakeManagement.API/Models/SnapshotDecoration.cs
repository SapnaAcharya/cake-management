namespace CakeManagementAPI.Models
{
    public class SnapshotDecoration
    {
        public int DecorationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
