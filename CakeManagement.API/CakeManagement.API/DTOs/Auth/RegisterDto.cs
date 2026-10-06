using System.ComponentModel.DataAnnotations;

namespace CakeManagement.DTOs.Auth
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2,
            ErrorMessage = "Name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6,
            ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }
    }
}