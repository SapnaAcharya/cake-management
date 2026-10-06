using CakeManagement.DTOs.Order;
using CakeManagementAPI.DTOs.Order;
using CakeManagementAPI.Data;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using CakeManagementAPI.DTOs.Cart;
using System.Text.Json;

namespace CakeManagementAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ICustomizationSnapshotService _snapshotService;
        private readonly CakePricingService _pricing;
        public OrderService(AppDbContext context,
            ICustomizationSnapshotService snapshotService,
            CakePricingService pricing)
        {
            _context = context;
            _snapshotService = snapshotService;
            _pricing = pricing;
        }

        // GET ALL ORDERS
        // Admin
        public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Cake)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders
                .Select(MapOrderToDto)
                .ToList();
        }


        // GET ORDER BY ID
        // Admin
        public async Task<OrderResponseDto> GetOrderByIdForAdminAsync(
            int orderId)
        {
            var order = await _context.Orders
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

        // Get order by id guest
        public async Task<OrderResponseDto> GetGuestOrderByIdAsync(int orderId, string phoneNumber)
        {
            var order = await _context.Orders
                 .Include(o => o.OrderItems)
                 .ThenInclude(oi => oi.Cake)
                 .FirstOrDefaultAsync(o => o.Id == orderId && o.PhoneNumber == phoneNumber);

            if (order == null)
            {
                throw new KeyNotFoundException("Order not found.");
            }
            return MapOrderToDto(order);
        }

        // UPDATE ORDER STATUS
        // Admin
        public async Task<OrderResponseDto> UpdateOrderStatusAsync(
            int orderId,
            string status)
        {
            var order = await _context.Orders
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

        public async Task<OrderResponseDto> CreateOrderAsync(
    int? userId,
    CreateOrderDto dto)
        {
            if (!userId.HasValue && string.IsNullOrWhiteSpace(dto.PhoneNumber))
                throw new ArgumentException("Phone number is required.");

            if (string.IsNullOrWhiteSpace(dto.ShippingAddress))
                throw new ArgumentException("Shipping address is required.");

            if (string.IsNullOrWhiteSpace(dto.PaymentMethod))
                throw new ArgumentException("Payment method is required.");

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                PhoneNumber = dto.PhoneNumber?.Trim(),
                ShippingAddress = dto.ShippingAddress.Trim(),
                PaymentMethod = dto.PaymentMethod.Trim(),
                PaymentStatus = "Pending",
                TotalAmount = 0
            };

            decimal totalAmount = 0;

            // REGISTERED CUSTOMER
            if (userId.HasValue)
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Cake)
                    .FirstOrDefaultAsync(c => c.UserId == userId.Value);

                if (cart == null || !cart.CartItems.Any())
                    throw new InvalidOperationException("Your cart is empty.");

                foreach (var cartItem in cart.CartItems)
                {
                    if (cartItem.Cake == null)
                        throw new KeyNotFoundException("Cake not found.");

                    var cake = cartItem.Cake;
                    var isCustomized = cartItem.CustomizationJson != null;

                    // Stock rules apply to ready-made cakes only
                    if (!isCustomized)
                    {
                        if (!cake.IsAvailable)
                            throw new InvalidOperationException(
                                $"The cake '{cake.Name}' is currently unavailable.");

                        if (cartItem.Quantity > cake.StockQuantity)
                            throw new InvalidOperationException(
                                $"Not enough stock available for '{cake.Name}'.");
                    }

                    var unitPrice = cartItem.CustomUnitPrice ?? cake.Price;
                    decimal subtotal = unitPrice * cartItem.Quantity;

                    order.OrderItems.Add(new OrderItem
                    {
                        Cake = cake,
                        CakeId = cake.Id,
                        Quantity = cartItem.Quantity,
                        UnitPrice = unitPrice,
                        Subtotal = subtotal,
                        CakeTemplateId = cartItem.CakeTemplateId,
                        CustomizationJson = cartItem.CustomizationJson
                    });

                    totalAmount += subtotal;

                    if (!isCustomized)
                    {
                        cake.StockQuantity -= cartItem.Quantity;
                        if (cake.StockQuantity == 0)
                            cake.IsAvailable = false;
                    }
                }

                _context.CartItems.RemoveRange(cart.CartItems);
                cart.UpdatedAt = DateTime.UtcNow;
            }
            // GUEST CUSTOMER
            else
            {
                if (dto.Items == null || !dto.Items.Any())
                    throw new InvalidOperationException("Guest cart is empty.");

                foreach (var item in dto.Items)
                {
                    if (item.Quantity < 1)
                        throw new ArgumentException("Quantity must be at least 1.");

                    var cake = await _context.Cakes
                        .FirstOrDefaultAsync(c => c.Id == item.CakeId);

                    if (cake == null)
                        throw new KeyNotFoundException(
                            $"Cake with ID {item.CakeId} was not found.");

                    var isCustomized = item.Customization != null;

                    if (!isCustomized)
                    {
                        if (!cake.IsAvailable)
                            throw new InvalidOperationException(
                                $"The cake '{cake.Name}' is currently unavailable.");

                        if (item.Quantity > cake.StockQuantity)
                            throw new InvalidOperationException(
                                $"Not enough stock available for '{cake.Name}'.");
                    }

                    // The server prices everything. Any price from the frontend is ignored.
                    decimal unitPrice = cake.Price;
                    int? templateId = null;
                    string? json = null;

                    if (isCustomized)
                    {
                        var snapshot = await _snapshotService.CreateSnapshotAsync(item.Customization!);
                        unitPrice = await _pricing.CalculateAsync(item.Customization!);
                        templateId = snapshot.TemplateId;
                        json = _snapshotService.ToJson(snapshot);
                    }

                    decimal subtotal = unitPrice * item.Quantity;

                    order.OrderItems.Add(new OrderItem
                    {
                        Cake = cake,
                        CakeId = cake.Id,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        Subtotal = subtotal,
                        CakeTemplateId = templateId,
                        CustomizationJson = json
                    });

                    totalAmount += subtotal;

                    if (!isCustomized)
                    {
                        cake.StockQuantity -= item.Quantity;
                        if (cake.StockQuantity == 0)
                            cake.IsAvailable = false;
                    }
                }
            }

            order.TotalAmount = totalAmount;
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return MapOrderToDto(order);
        }

        // GET ONE ORDER FOR LOGGED-IN CUSTOMER

        public async Task<OrderResponseDto> GetOrderByIdAsync(
            int userId,
            int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Cake)
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.UserId == userId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }


        // GET ALL ORDERS FOR LOGGED-IN CUSTOMER
        public async Task<List<OrderResponseDto>> GetMyOrdersAsync(
            int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Cake)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders
                .Select(MapOrderToDto)
                .ToList();
        }


        // MAP ORDER TO DTO
        
        private OrderResponseDto MapOrderToDto(
            Order order)
        {
            var items = order.OrderItems
                .Select(oi => new OrderItemResponseDto
                {
                    OrderItemId = oi.Id,

                    CakeId = oi.CakeId,

                    CakeName = oi.Cake!.Name,

                    Quantity = oi.Quantity,

                    UnitPrice = oi.UnitPrice,

                    Subtotal = oi.Subtotal,

                    IsCustomized = oi.CustomizationJson != null,
                    Customization = oi.CustomizationJson == null
            ? null
            : JsonSerializer.Deserialize<CustomizationSnapshot>(oi.CustomizationJson)
                })
                .ToList();

            return new OrderResponseDto
            {
                OrderId = order.Id,

                UserId = order.UserId,

                PhoneNumber = order.PhoneNumber,

                OrderDate = order.OrderDate,

                TotalAmount = order.TotalAmount,

                Status = order.Status,

                ShippingAddress = order.ShippingAddress,

                PaymentMethod = order.PaymentMethod,

                PaymentStatus = order.PaymentStatus,

                Items = items
            };
        }
    }
}