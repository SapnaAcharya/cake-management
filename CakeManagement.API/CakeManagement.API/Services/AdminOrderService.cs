using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.AdminOrder;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class AdminOrderService : IAdminOrderService
    {
        private readonly AppDbContext _context;

        public AdminOrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminOrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Cake)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders
                .Select(MapOrderToDto)
                .ToList();
        }

        public async Task<AdminOrderResponseDto> GetOrderByIdAsync(
            int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Cake)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }

        public async Task<AdminOrderResponseDto> UpdateOrderStatusAsync(
            int orderId,
            string status)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Cake)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            var allowedStatuses = new[]
            {
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            };

            if (!allowedStatuses.Contains(status))
            {
                throw new ArgumentException(
                    "Invalid order status.");
            }

            order.Status = status;

            await _context.SaveChangesAsync();

            return MapOrderToDto(order);
        }

        private AdminOrderResponseDto MapOrderToDto(
            Models.Order order)
        {
            return new AdminOrderResponseDto
            {
                OrderId = order.Id,

                UserId = order.UserId,

                CustomerName = order.User?.Name ?? string.Empty,

                CustomerEmail = order.User?.Email ?? string.Empty,

                OrderDate = order.OrderDate,

                TotalAmount = order.TotalAmount,

                Status = order.Status,

                ShippingAddress = order.ShippingAddress,

                PaymentMethod = order.PaymentMethod,

                PaymentStatus = order.PaymentStatus,

                Items = order.OrderItems
                    .Where(oi => oi.Cake != null)
                    .Select(oi => new AdminOrderItemDto
                    {
                        CakeId = oi.CakeId,

                        CakeName = oi.Cake!.Name,

                        Quantity = oi.Quantity,

                        UnitPrice = oi.UnitPrice,

                        Subtotal = oi.Subtotal
                    })
                    .ToList()
            };
        }
    }
}