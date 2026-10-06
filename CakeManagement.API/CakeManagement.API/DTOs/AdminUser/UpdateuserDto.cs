namespace CakeManagementAPI.DTOs.AdminUser
{
    public class UpdateuserDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string Role { get; set; } = "Customer";
    }
}
