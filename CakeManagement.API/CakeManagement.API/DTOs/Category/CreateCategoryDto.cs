using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Category
{
    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [StringLength(100, MinimumLength = 2,
            ErrorMessage = "Catgeory name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500,
            ErrorMessage = "Description cannot exceed 500 charaters")]
        public string Description { get; set; } = string.Empty;
    }
}
