using CakeManagementAPI.DTOs.Cart;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface ICustomizationService
    {
        Task<CustomizationResult> BuildAsync(CustomizationDto customization);
    }
}
