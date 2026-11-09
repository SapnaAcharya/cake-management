using CakeManagement.DTOs.Order;
using CakeManagementAPI.DTOs.Order;
using CakeManagementAPI.Data;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using CakeManagementAPI.DTOs.Cart;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CakeManagementAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ICustomizationSnapshotService _snapshotService;
        private readonly CakePricingService _pricing;

        public OrderService(
            AppDbContext context,
            ICustomizationSnapshotService snapshotService,
            CakePricingService pricing)
        {
            _context = context;
            _snapshotService = snapshotService;
            _pricing = pricing;
        }

        // Shared query: orders with items, cakes and templates
        private IQueryable<Order> OrdersWithItems() =>
            _context.Orders
                .AsSplitQuery()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Cake)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.CakeTemplate);


        // ==========================================
        // GET ALL ORDERS
        // Admin
        // ==========================================

        public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await OrdersWithItems()
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders
                .Select(MapOrderToDto)
                .ToList();
        }


        // ==========================================
        // GET ORDER BY ID
        // Admin
        // ==========================================

        public async Task<OrderResponseDto> GetOrderByIdForAdminAsync(
            int orderId)
        {
            var order = await OrdersWithItems()
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }


        // ==========================================
        // GET GUEST ORDER BY ID
        // ==========================================

        public async Task<OrderResponseDto> GetGuestOrderByIdAsync(
            int orderId,
            string phoneNumber)
        {
            var order = await OrdersWithItems()
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.PhoneNumber == phoneNumber);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }


        // ==========================================
        // GET GUEST ORDER BY PUBLIC GUID
        // ==========================================

        public async Task<OrderResponseDto> GetGuestOrderByPublicIdAsync(
            Guid publicId,
            string phoneNumber)
        {
            var normalizedPhone = phoneNumber?.Trim();

            var order = await OrdersWithItems()
                .FirstOrDefaultAsync(o =>
                    o.PublicId == publicId &&
                    o.PhoneNumber == normalizedPhone &&
                    o.UserId == null);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }


        // ==========================================
        // UPDATE ORDER STATUS
        // Admin
        // ==========================================

        public async Task<OrderResponseDto> UpdateOrderStatusAsync(
            int orderId,
            string status)
        {
            var order = await OrdersWithItems()
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


        // ==========================================
        // CREATE ORDER
        // Registered Customer and Guest Customer
        // ==========================================

        public async Task<OrderResponseDto> CreateOrderAsync(
            int? userId,
            CreateOrderDto dto)
        {
            // ----------------------------------
            // 1. VALIDATE GUEST PHONE NUMBER
            // ----------------------------------

            if (!userId.HasValue)
            {
                var phoneNumber = dto.PhoneNumber?.Trim();

                if (string.IsNullOrWhiteSpace(phoneNumber))
                {
                    throw new ArgumentException(
                        "Phone number is required.");
                }

                if (!Regex.IsMatch(phoneNumber, @"^9[678]\d{8}$"))
                {
                    throw new ArgumentException(
                        "Please provide a valid 10-digit Nepal mobile number.");
                }

                dto.PhoneNumber = phoneNumber;
            }


            // ----------------------------------
            // 2. VALIDATE SHIPPING ADDRESS
            // ----------------------------------

            if (string.IsNullOrWhiteSpace(dto.ShippingAddress))
            {
                throw new ArgumentException(
                    "Shipping address is required.");
            }


            // ----------------------------------
            // 3. VALIDATE PAYMENT METHOD
            // ----------------------------------

            if (!string.Equals(
                dto.PaymentMethod?.Trim(),
                "CashOnDelivery",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "Invalid payment method. Only CashOnDelivery is supported.");
            }


            // ----------------------------------
            // 4. VALIDATE DELIVERY COORDINATES
            // ----------------------------------

            // Both coordinates must be provided together.
            // They cannot be provided individually.

            if (dto.Latitude.HasValue != dto.Longitude.HasValue)
            {
                throw new ArgumentException(
                    "Both latitude and longitude must be provided together.");
            }

            // Validate latitude range: -90 to 90.

            if (dto.Latitude.HasValue &&
                (dto.Latitude.Value < -90 ||
                 dto.Latitude.Value > 90))
            {
                throw new ArgumentException(
                    "Invalid latitude. Latitude must be between -90 and 90.");
            }

            // Validate longitude range: -180 to 180.

            if (dto.Longitude.HasValue &&
                (dto.Longitude.Value < -180 ||
                 dto.Longitude.Value > 180))
            {
                throw new ArgumentException(
                    "Invalid longitude. Longitude must be between -180 and 180.");
            }


            // ----------------------------------
            // 5. CREATE ORDER OBJECT
            // ----------------------------------

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                PhoneNumber = dto.PhoneNumber?.Trim(),
                ShippingAddress = dto.ShippingAddress.Trim(),

                // Store the normalized payment method.
                PaymentMethod = "CashOnDelivery",

                // Delivery location coordinates
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,

                PaymentStatus = "Pending",
                TotalAmount = 0
            };

            decimal totalAmount = 0;


            // ==========================================
            // REGISTERED CUSTOMER CHECKOUT
            // ==========================================

            if (userId.HasValue)
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Cake)
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.CakeTemplate)
                    .FirstOrDefaultAsync(
                        c => c.UserId == userId.Value);

                if (cart == null || !cart.CartItems.Any())
                {
                    throw new InvalidOperationException(
                        "Your cart is empty.");
                }

                foreach (var cartItem in cart.CartItems)
                {
                    if (cartItem.Quantity < 1)
                    {
                        throw new ArgumentException(
                            "Quantity must be at least 1.");
                    }

                    var isCustomized =
                        cartItem.CustomizationJson != null;

                    var cake = cartItem.Cake;

                    decimal unitPrice;
                    decimal messageAdditionalPrice = 0m;
                    string? personalizedMessage = null;


                    // ----------------------------------
                    // CUSTOMIZED CAKE
                    // ----------------------------------

                    if (isCustomized)
                    {
                        // Customized cakes do not support
                        // personalized messages.

                        if (!string.IsNullOrWhiteSpace(
                            cartItem.PersonalizedMessage))
                        {
                            throw new InvalidOperationException(
                                "Personalized messages are not available for customized cakes.");
                        }

                        unitPrice = cartItem.CustomUnitPrice
                            ?? throw new InvalidOperationException(
                                "Customized cake has no price.");
                    }


                    // ----------------------------------
                    // NORMAL CAKE
                    // ----------------------------------

                    else
                    {
                        if (cake == null)
                        {
                            throw new KeyNotFoundException(
                                "Cake not found.");
                        }

                        if (!cake.IsAvailable)
                        {
                            throw new InvalidOperationException(
                                $"The cake '{cake.Name}' is currently unavailable.");
                        }

                        if (cartItem.Quantity > cake.StockQuantity)
                        {
                            throw new InvalidOperationException(
                                $"Not enough stock available for '{cake.Name}'.");
                        }

                        // Validate personalized message.

                        personalizedMessage =
                            ValidatePersonalizedMessage(
                                cake,
                                cartItem.PersonalizedMessage);

                        // Calculate message surcharge.

                        messageAdditionalPrice =
                            personalizedMessage != null
                                ? cake.MessageAdditionalPrice
                                : 0m;

                        // Final unit price includes surcharge.

                        unitPrice =
                            cake.Price + messageAdditionalPrice;
                    }


                    // ----------------------------------
                    // CALCULATE SUBTOTAL
                    // ----------------------------------

                    decimal subtotal =
                        unitPrice * cartItem.Quantity;


                    // ----------------------------------
                    // CREATE ORDER ITEM
                    // ----------------------------------

                    order.OrderItems.Add(new OrderItem
                    {
                        Cake = cake,
                        CakeId = cartItem.CakeId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = unitPrice,
                        Subtotal = subtotal,
                        MessageAdditionalPrice = messageAdditionalPrice,
                        CakeTemplateId = cartItem.CakeTemplateId,
                        CakeTemplate = cartItem.CakeTemplate,
                        CustomizationJson = cartItem.CustomizationJson,
                        PersonalizedMessage = personalizedMessage
                    });

                    totalAmount += subtotal;


                    // ----------------------------------
                    // REDUCE STOCK
                    // Normal cakes only
                    // ----------------------------------

                    if (!isCustomized && cake != null)
                    {
                        cake.StockQuantity -= cartItem.Quantity;

                        if (cake.StockQuantity == 0)
                        {
                            cake.IsAvailable = false;
                        }
                    }
                }


                // ----------------------------------
                // REMOVE PURCHASED CART ITEMS
                // ----------------------------------

                _context.CartItems.RemoveRange(cart.CartItems);

                cart.UpdatedAt = DateTime.UtcNow;
            }


            // ==========================================
            // GUEST CUSTOMER CHECKOUT
            // ==========================================

            else
            {
                if (dto.Items == null || !dto.Items.Any())
                {
                    throw new InvalidOperationException(
                        "Guest cart is empty.");
                }

                foreach (var item in dto.Items)
                {
                    // ----------------------------------
                    // VALIDATE QUANTITY
                    // ----------------------------------

                    if (item.Quantity < 1)
                    {
                        throw new ArgumentException(
                            "Quantity must be at least 1.");
                    }

                    var isCustomized = item.Customization != null;


                    // ----------------------------------
                    // VALIDATE ITEM TYPE
                    // ----------------------------------

                    if (item.CakeId == null &&
                        item.Customization == null)
                    {
                        throw new ArgumentException(
                            "Either CakeId or Customization is required.");
                    }

                    if (item.CakeId != null &&
                        item.Customization != null)
                    {
                        throw new ArgumentException(
                            "An order item cannot contain both a normal cake and a customized cake.");
                    }

                    // Customized cakes do not support
                    // personalized messages.

                    if (isCustomized &&
                        !string.IsNullOrWhiteSpace(item.PersonalizedMessage))
                    {
                        throw new InvalidOperationException(
                            "Personalized messages are not available for customized cakes.");
                    }


                    Cake? cake = null;
                    CakeTemplate? template = null;

                    decimal unitPrice;
                    decimal messageAdditionalPrice = 0m;

                    int? templateId = null;
                    string? json = null;
                    string? personalizedMessage = null;


                    // ----------------------------------
                    // CUSTOMIZED CAKE
                    // ----------------------------------

                    if (isCustomized)
                    {
                        // Create customization snapshot.

                        var snapshot =
                            await _snapshotService.CreateSnapshotAsync(
                                item.Customization!);

                        // Calculate price on server.

                        unitPrice =
                            await _pricing.CalculateAsync(
                                item.Customization!);

                        templateId = snapshot.TemplateId;

                        json = _snapshotService.ToJson(snapshot);

                        template = await _context.CakeTemplates
                            .FindAsync(snapshot.TemplateId);
                    }


                    // ----------------------------------
                    // NORMAL CAKE
                    // ----------------------------------

                    else
                    {
                        if (item.CakeId == null)
                        {
                            throw new ArgumentException(
                                "CakeId is required for normal cakes.");
                        }

                        cake = await _context.Cakes
                            .FirstOrDefaultAsync(
                                c => c.Id == item.CakeId.Value);

                        if (cake == null)
                        {
                            throw new KeyNotFoundException(
                                $"Cake with ID {item.CakeId} was not found.");
                        }

                        if (!cake.IsAvailable)
                        {
                            throw new InvalidOperationException(
                                $"The cake '{cake.Name}' is currently unavailable.");
                        }

                        if (item.Quantity > cake.StockQuantity)
                        {
                            throw new InvalidOperationException(
                                $"Not enough stock available for '{cake.Name}'.");
                        }

                        // Validate personalized message.

                        personalizedMessage =
                            ValidatePersonalizedMessage(
                                cake,
                                item.PersonalizedMessage);

                        // Calculate message surcharge.

                        messageAdditionalPrice =
                            personalizedMessage != null
                                ? cake.MessageAdditionalPrice
                                : 0m;

                        // Final unit price includes surcharge.

                        unitPrice =
                            cake.Price + messageAdditionalPrice;
                    }


                    // ----------------------------------
                    // CALCULATE SUBTOTAL
                    // ----------------------------------

                    decimal subtotal =
                        unitPrice * item.Quantity;


                    // ----------------------------------
                    // CREATE ORDER ITEM
                    // ----------------------------------

                    order.OrderItems.Add(new OrderItem
                    {
                        Cake = cake,
                        CakeId = cake?.Id,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        Subtotal = subtotal,
                        MessageAdditionalPrice = messageAdditionalPrice,
                        CakeTemplateId = templateId,
                        CakeTemplate = template,
                        CustomizationJson = json,
                        PersonalizedMessage = personalizedMessage
                    });

                    totalAmount += subtotal;


                    // ----------------------------------
                    // REDUCE STOCK
                    // Normal cakes only
                    // ----------------------------------

                    if (!isCustomized && cake != null)
                    {
                        cake.StockQuantity -= item.Quantity;

                        if (cake.StockQuantity == 0)
                        {
                            cake.IsAvailable = false;
                        }
                    }
                }
            }


            // ==========================================
            // SAVE ORDER
            // ==========================================

            order.TotalAmount = totalAmount;

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            return MapOrderToDto(order);
        }


        // ==========================================
        // VALIDATE PERSONALIZED MESSAGE
        // ==========================================

        private string? ValidatePersonalizedMessage(
            Cake cake,
            string? personalizedMessage)
        {
            var message = personalizedMessage?.Trim();

            // No message provided.

            if (string.IsNullOrWhiteSpace(message))
            {
                return null;
            }

            // Check whether admin enabled messages.

            if (!cake.AllowMessage)
            {
                throw new InvalidOperationException(
                    $"Personalized messages are not available for '{cake.Name}'.");
            }

            // Check configured maximum length.

            if (cake.MaxMessageLength < 1)
            {
                throw new InvalidOperationException(
                    "The maximum message length is not configured correctly.");
            }

            if (message.Length > cake.MaxMessageLength)
            {
                throw new ArgumentException(
                    $"Message for '{cake.Name}' cannot exceed {cake.MaxMessageLength} characters.");
            }

            // Check additional price.

            if (cake.MessageAdditionalPrice < 0)
            {
                throw new InvalidOperationException(
                    "The personalized message price is invalid.");
            }

            return message;
        }


        // ==========================================
        // GET ONE ORDER FOR LOGGED-IN CUSTOMER
        // ==========================================

        public async Task<OrderResponseDto> GetOrderByIdAsync(
            int userId,
            int orderId)
        {
            var order = await OrdersWithItems()
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


        // ==========================================
        // GET ONE ORDER FOR LOGGED-IN CUSTOMER BY GUID
        // ==========================================

        public async Task<OrderResponseDto> GetOrderByPublicIdAsync(
            int userId,
            Guid publicId)
        {
            var order = await OrdersWithItems()
                .FirstOrDefaultAsync(o =>
                    o.PublicId == publicId &&
                    o.UserId == userId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }


        // ==========================================
        // GET ALL ORDERS FOR LOGGED-IN CUSTOMER
        // ==========================================

        public async Task<List<OrderResponseDto>> GetMyOrdersAsync(
            int userId)
        {
            var orders = await OrdersWithItems()
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders
                .Select(MapOrderToDto)
                .ToList();
        }


        // ==========================================
        // MAP ORDER TO DTO
        // ==========================================

        private OrderResponseDto MapOrderToDto(
            Order order)
        {
            var items = order.OrderItems
                .Select(oi => new OrderItemResponseDto
                {
                    OrderItemId = oi.Id,

                    CakeId = oi.CakeId,

                    CakeName = oi.Cake?.Name
                               ?? oi.CakeTemplate?.Name
                               ?? "Custom Cake",

                    Quantity = oi.Quantity,

                    UnitPrice = oi.UnitPrice,

                    Subtotal = oi.Subtotal,

                    MessageAdditionalPrice = oi.MessageAdditionalPrice,

                    IsCustomized = oi.CustomizationJson != null,

                    Customization = oi.CustomizationJson == null
                        ? null
                        : JsonSerializer.Deserialize<CustomizationSnapshot>(
                            oi.CustomizationJson),

                    PersonalizedMessage = oi.PersonalizedMessage
                })
                .ToList();


            return new OrderResponseDto
            {
                OrderId = order.Id,

                // Public GUID for order reference.
                PublicId = order.PublicId,

                UserId = order.UserId,

                PhoneNumber = order.PhoneNumber,

                OrderDate = order.OrderDate,

                TotalAmount = order.TotalAmount,

                Status = order.Status,

                ShippingAddress = order.ShippingAddress,

                // Delivery location coordinates.
                Latitude = order.Latitude,

                Longitude = order.Longitude,

                PaymentMethod = order.PaymentMethod,

                PaymentStatus = order.PaymentStatus,

                Items = items
            };
        }
    }
}
