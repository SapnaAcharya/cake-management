
namespace CakeManagementAPI.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
       
        // One category can have many cakes
        public ICollection<Cake> Cakes { get; set; } = new List<Cake>();
    }
}
