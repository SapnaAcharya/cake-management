using CakeManagement.DTOs.Order;
using CakeManagementAPI.DTOs.Order;

namespace CakeManagementAPI.Services.Interfaces
{
    public interface IOrderService
    {
        // Create an order from the customer's/guest cart
        Task<OrderResponseDto> CreateOrderAsync(
            int? userId,
            CreateOrderDto dto);

        // Get a specific order belonging to the customer
        Task<OrderResponseDto> GetOrderByIdAsync(
            int userId,
            int orderId);

        // Get all orders belonging to the customer
        Task<List<OrderResponseDto>> GetMyOrdersAsync(
            int userId);

        Task<List<OrderResponseDto>> GetAllOrdersAsync();
        Task<OrderResponseDto> GetOrderByIdForAdminAsync(int orderId);

        Task<OrderResponseDto> GetGuestOrderByIdAsync(int orderId, string phoneNumber);
        Task<OrderResponseDto> UpdateOrderStatusAsync(int orderId, string status);
    }
}