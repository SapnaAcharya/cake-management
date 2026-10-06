using CakeManagementAPI.DTOs.Cart;

namespace CakeManagementAPI.Services
{
    public interface ICustomizationSnapshotService
    {
        Task<CustomizationSnapshot> CreateSnapshotAsync(CustomizationDto dto);
        string ToJson(CustomizationSnapshot snapshot);
    }
}