using CakeManagementAPI.DTOs.AdminOrder;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IAdminOrderService
    {
        Task<List<AdminOrderResponseDto>> GetAllOrdersAsync();

        Task<AdminOrderResponseDto> GetOrderByIdAsync(
            int orderId);

        Task<AdminOrderResponseDto> UpdateOrderStatusAsync(
            int orderId,
            string status);
    }
}