
using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Training
{
    public class CreateTrainerDto
    {
        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string Qualifications { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Bio { get; set; }

        [EmailAddress]
        [StringLength(254)]
        public string? Email { get; set; }

        [Phone]
        [StringLength(30)]
        public string? PhoneNumber { get; set; }
    }
}
