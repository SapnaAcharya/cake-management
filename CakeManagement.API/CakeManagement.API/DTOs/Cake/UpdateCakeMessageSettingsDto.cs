using System.ComponentModel.DataAnnotations;

namespace CakeManagementAPI.DTOs.Cake
{
    public class UpdateCakeMessageSettingsDto
    {
        public bool AllowMessage { get; set; }

        [StringLength(100)]
        public string? MessageLabel { get; set; }

        [StringLength(200)]
        public string? MessagePlaceholder { get; set; }

        [Range(0, 500)]
        public int? MaxMessageLength { get; set; }

        [Range(0, 100000)]
        public decimal MessageAdditionalPrice { get; set; }
    }
}