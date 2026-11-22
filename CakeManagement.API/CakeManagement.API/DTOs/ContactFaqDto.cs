namespace CakeManagementAPI.DTOs.Contact
{
    public class ContactFaqDto
    {
        public int Id { get; set; }

        public string Question { get; set; } = string.Empty;

        public string Answer { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }
    }
}