//using CakeManagement.DTOs.Order;
//using CakeManagementAPI.DTOs.Order;
//using CakeManagementAPI.Data;
//using CakeManagementAPI.Models;
//using CakeManagementAPI.Services.Interfaces;
//using Microsoft.EntityFrameworkCore;
//using CakeManagementAPI.DTOs.Cart;
//using System.Text.Json;

//namespace CakeManagementAPI.Services
//{
//    public class OrderService : IOrderService
//    {
//        private readonly AppDbContext _context;
//        private readonly ICustomizationSnapshotService _snapshotService;
//        private readonly CakePricingService _pricing;
//        public OrderService(AppDbContext context,
//            ICustomizationSnapshotService snapshotService,
//            CakePricingService pricing)
//        {
//            _context = context;
//            _snapshotService = snapshotService;
//            _pricing = pricing;
//        }

//        // Shared query: orders with items, cakes and templates
//        private IQueryable<Order> OrdersWithItems() =>
//            _context.Orders
//                .AsSplitQuery()
//                .Include(o => o.OrderItems)
//                    .ThenInclude(oi => oi.Cake)
//                .Include(o => o.OrderItems)
//                    .ThenInclude(oi => oi.CakeTemplate);

//        // GET ALL ORDERS
//        // Admin
//        public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
//        {
//            var orders = await OrdersWithItems()
//                .OrderByDescending(o => o.OrderDate)
//                .ToListAsync();

//            return orders
//                .Select(MapOrderToDto)
//                .ToList();
//        }


//        // GET ORDER BY ID
//        // Admin
//        public async Task<OrderResponseDto> GetOrderByIdForAdminAsync(
//            int orderId)
//        {
//            var order = await OrdersWithItems()
//                .FirstOrDefaultAsync(o => o.Id == orderId);

//            if (order == null)
//            {
//                throw new KeyNotFoundException(
//                    "Order not found.");
//            }

//            return MapOrderToDto(order);
//        }

//        // Get order by id guest
//        public async Task<OrderResponseDto> GetGuestOrderByIdAsync(int orderId, string phoneNumber)
//        {
//            var order = await OrdersWithItems()
//                 .FirstOrDefaultAsync(o => o.Id == orderId && o.PhoneNumber == phoneNumber);

//            if (order == null)
//            {
//                throw new KeyNotFoundException("Order not found.");
//            }
//            return MapOrderToDto(order);
//        }

//        // UPDATE ORDER STATUS
//        // Admin
//        public async Task<OrderResponseDto> UpdateOrderStatusAsync(
//            int orderId,
//            string status)
//        {
//            var order = await OrdersWithItems()
//                .FirstOrDefaultAsync(o => o.Id == orderId);

//            if (order == null)
//            {
//                throw new KeyNotFoundException(
//                    "Order not found.");
//            }

//            var allowedStatuses = new[]
//            {
//                "Pending",
//                "Confirmed",
//                "Processing",
//                "Shipped",
//                "Delivered",
//                "Cancelled"
//            };

//            if (!allowedStatuses.Contains(status))
//            {
//                throw new ArgumentException(
//                    "Invalid order status.");
//            }

//            order.Status = status;

//            await _context.SaveChangesAsync();

//            return MapOrderToDto(order);
//        }

//        public async Task<OrderResponseDto> CreateOrderAsync(
//            int? userId,
//            CreateOrderDto dto)
//        {
//            if (!userId.HasValue && string.IsNullOrWhiteSpace(dto.PhoneNumber))
//                throw new ArgumentException("Phone number is required.");

//            if (string.IsNullOrWhiteSpace(dto.ShippingAddress))
//                throw new ArgumentException("Shipping address is required.");

//            if (string.IsNullOrWhiteSpace(dto.PaymentMethod))
//                throw new ArgumentException("Payment method is required.");

//            var order = new Order
//            {
//                UserId = userId,
//                OrderDate = DateTime.UtcNow,
//                Status = "Pending",
//                PhoneNumber = dto.PhoneNumber?.Trim(),
//                ShippingAddress = dto.ShippingAddress.Trim(),
//                PaymentMethod = dto.PaymentMethod.Trim(),

//                // Delivery location coordnates
//                Latitude  = dto.Latitude,
//                Longitude = dto.Longitude,

//                PaymentStatus = "Pending",
//                TotalAmount = 0
//            };

//            decimal totalAmount = 0;

//            // REGISTERED CUSTOMER
//            if (userId.HasValue)
//            {
//                var cart = await _context.Carts
//                    .Include(c => c.CartItems)
//                        .ThenInclude(ci => ci.Cake)
//                    .Include(c => c.CartItems)
//                        .ThenInclude(ci => ci.CakeTemplate)
//                    .FirstOrDefaultAsync(c => c.UserId == userId.Value);

//                if (cart == null || !cart.CartItems.Any())
//                    throw new InvalidOperationException("Your cart is empty.");

//                //foreach (var cartItem in cart.CartItems)
//                //{
//                //    var isCustomized = cartItem.CustomizationJson != null;
//                //    var cake = cartItem.Cake;

//                //    decimal unitPrice;
//                //    string? personalizedMessage = null;

//                //    // Stock rules apply to ready-made cakes only
//                //    if (!isCustomized)
//                //    {
//                //        {
//                //            // Customized cakes do not support personalized messages.
//                //            unitPrice = cartItem.CustomUnitPrice
//                //                ?? throw new InvalidOperationException(
//                //                    "Customized cake has no price.");
//                //        }
//                //        else
//                //        {
//                //            if (cake == null)
//                //            throw new KeyNotFoundException("Cake not found.");

//                //        if (!cake.IsAvailable)
//                //            throw new InvalidOperationException(
//                //                $"The cake '{cake.Name}' is currently unavailable.");

//                //        if (cartItem.Quantity > cake.StockQuantity)
//                //            throw new InvalidOperationException(
//                //                $"Not enough stock available for '{cake.Name}'.");
//                //    }

//                //        // Validate the personalized message.
//                //        personalizedMessage = ValidatePersonalizedMessage(
//                //            cake,
//                //            cartItem.PersonalizedMessage);

//                //        var unitPrice = cartItem.CustomUnitPrice
//                //                    ?? cake?.Price
//                //                    ?? throw new InvalidOperationException(
//                //                        "Cart item has no price.");

//                //    decimal subtotal = unitPrice * cartItem.Quantity;

//                //    order.OrderItems.Add(new OrderItem
//                //    {
//                //        Cake = cake,
//                //        CakeId = cartItem.CakeId,
//                //        Quantity = cartItem.Quantity,
//                //        UnitPrice = unitPrice,
//                //        Subtotal = subtotal,
//                //        CakeTemplateId = cartItem.CakeTemplateId,
//                //        CakeTemplate = cartItem.CakeTemplate,
//                //        CustomizationJson = cartItem.CustomizationJson
//                //    });

//                //    totalAmount += subtotal;

//                //    // Stock reduces for normal cakes only
//                //    if (!isCustomized && cake != null)
//                //    {
//                //        cake.StockQuantity -= cartItem.Quantity;
//                //        if (cake.StockQuantity == 0)
//                //            cake.IsAvailable = false;
//                //    }
//                //}
//                foreach (var cartItem in cart.CartItems)
//                {
//                    var isCustomized = cartItem.CustomizationJson != null;
//                    var cake = cartItem.Cake;

//                    decimal unitPrice;
//                    string? personalizedMessage = null;

//                    if (isCustomized)
//                    {
//                        // Customized cakes do not support personalized messages.
//                        unitPrice = cartItem.CustomUnitPrice
//                            ?? throw new InvalidOperationException(
//                                "Customized cake has no price.");
//                    }
//                    else
//                    {
//                        if (cake == null)
//                            throw new KeyNotFoundException("Cake not found.");

//                        if (!cake.IsAvailable)
//                            throw new InvalidOperationException(
//                                $"The cake '{cake.Name}' is currently unavailable.");

//                        if (cartItem.Quantity > cake.StockQuantity)
//                            throw new InvalidOperationException(
//                                $"Not enough stock available for '{cake.Name}'.");

//                        // Validate the personalized message.
//                        personalizedMessage = ValidatePersonalizedMessage(
//                            cake,
//                            cartItem.PersonalizedMessage);

//                        // Add the extra price only when a message is provided.
//                        unitPrice = cake.Price;

//                        if (personalizedMessage != null)
//                        {
//                            unitPrice += cake.MessageAdditionalPrice;
//                        }
//                    }

//                    decimal subtotal = unitPrice * cartItem.Quantity;

//                    order.OrderItems.Add(new OrderItem
//                    {
//                        Cake = cake,
//                        CakeId = cartItem.CakeId,
//                        Quantity = cartItem.Quantity,
//                        UnitPrice = unitPrice,
//                        Subtotal = subtotal,
//                        CakeTemplateId = cartItem.CakeTemplateId,
//                        CakeTemplate = cartItem.CakeTemplate,
//                        CustomizationJson = cartItem.CustomizationJson,

//                        // Save personalized message.
//                        PersonalizedMessage = personalizedMessage
//                    });

//                    totalAmount += subtotal;

//                    // Reduce stock for normal cakes only.
//                    if (!isCustomized && cake != null)
//                    {
//                        cake.StockQuantity -= cartItem.Quantity;

//                        if (cake.StockQuantity == 0)
//                            cake.IsAvailable = false;
//                    }
//                }

//                _context.CartItems.RemoveRange(cart.CartItems);
//                cart.UpdatedAt = DateTime.UtcNow;
//            }
//            // GUEST CUSTOMER
//            else
//            {
//                if (dto.Items == null || !dto.Items.Any())
//                    throw new InvalidOperationException("Guest cart is empty.");

//                //foreach (var item in dto.Items)
//                //{
//                //    if (item.Quantity < 1)
//                //        throw new ArgumentException("Quantity must be at least 1.");

//                //    var isCustomized = item.Customization != null;

//                //    Cake? cake = null;
//                //    CakeTemplate? template = null;
//                //    decimal unitPrice;
//                //    int? templateId = null;
//                //    string? json = null;

//                //    if (isCustomized)
//                //    {
//                //        // The server prices everything. Any price from the frontend is ignored.
//                //        var snapshot = await _snapshotService.CreateSnapshotAsync(item.Customization!);
//                //        unitPrice = await _pricing.CalculateAsync(item.Customization!);
//                //        templateId = snapshot.TemplateId;
//                //        json = _snapshotService.ToJson(snapshot);
//                //        template = await _context.CakeTemplates.FindAsync(snapshot.TemplateId);
//                //    }
//                //    else
//                //    {
//                //        if (item.CakeId == null)
//                //            throw new ArgumentException(
//                //                "CakeId is required for normal cakes.");

//                //        cake = await _context.Cakes
//                //            .FirstOrDefaultAsync(c => c.Id == item.CakeId.Value);

//                //        if (cake == null)
//                //            throw new KeyNotFoundException(
//                //                $"Cake with ID {item.CakeId} was not found.");

//                //        if (!cake.IsAvailable)
//                //            throw new InvalidOperationException(
//                //                $"The cake '{cake.Name}' is currently unavailable.");

//                //        if (item.Quantity > cake.StockQuantity)
//                //            throw new InvalidOperationException(
//                //                $"Not enough stock available for '{cake.Name}'.");

//                //        unitPrice = cake.Price;
//                //    }

//                //    decimal subtotal = unitPrice * item.Quantity;

//                //    order.OrderItems.Add(new OrderItem
//                //    {
//                //        Cake = cake,
//                //        CakeId = cake?.Id,
//                //        Quantity = item.Quantity,
//                //        UnitPrice = unitPrice,
//                //        Subtotal = subtotal,
//                //        CakeTemplateId = templateId,
//                //        CakeTemplate = template,
//                //        CustomizationJson = json
//                //    });

//                //    totalAmount += subtotal;

//                //    // Stock reduces for normal cakes only
//                //    if (cake != null)
//                //    {
//                //        cake.StockQuantity -= item.Quantity;
//                //        if (cake.StockQuantity == 0)
//                //            cake.IsAvailable = false;
//                //    }
//                //}
//                foreach (var item in dto.Items)
//                {
//                    if (item.Quantity < 1)
//                        throw new ArgumentException(
//                            "Quantity must be at least 1.");

//                    var isCustomized = item.Customization != null;

//                    Cake? cake = null;
//                    CakeTemplate? template = null;

//                    decimal unitPrice;
//                    int? templateId = null;
//                    string? json = null;
//                    string? personalizedMessage = null;

//                    if (isCustomized)
//                    {
//                        // Customized cake workflow remains unchanged.
//                        var snapshot = await _snapshotService.CreateSnapshotAsync(
//                            item.Customization!);

//                        unitPrice = await _pricing.CalculateAsync(
//                            item.Customization!);

//                        templateId = snapshot.TemplateId;
//                        json = _snapshotService.ToJson(snapshot);

//                        template = await _context.CakeTemplates.FindAsync(
//                            snapshot.TemplateId);
//                    }
//                    else
//                    {
//                        if (item.CakeId == null)
//                            throw new ArgumentException(
//                                "CakeId is required for normal cakes.");

//                        cake = await _context.Cakes
//                            .FirstOrDefaultAsync(c => c.Id == item.CakeId.Value);

//                        if (cake == null)
//                            throw new KeyNotFoundException(
//                                $"Cake with ID {item.CakeId} was not found.");

//                        if (!cake.IsAvailable)
//                            throw new InvalidOperationException(
//                                $"The cake '{cake.Name}' is currently unavailable.");

//                        if (item.Quantity > cake.StockQuantity)
//                            throw new InvalidOperationException(
//                                $"Not enough stock available for '{cake.Name}'.");

//                        personalizedMessage = ValidatePersonalizedMessage(
//                            cake,
//                            item.PersonalizedMessage);

//                        unitPrice = cake.Price;

//                        if (personalizedMessage != null)
//                        {
//                            unitPrice += cake.MessageAdditionalPrice;
//                        }
//                    }

//                    decimal subtotal = unitPrice * item.Quantity;

//                    order.OrderItems.Add(new OrderItem
//                    {
//                        Cake = cake,
//                        CakeId = cake?.Id,
//                        Quantity = item.Quantity,
//                        UnitPrice = unitPrice,
//                        Subtotal = subtotal,
//                        CakeTemplateId = templateId,
//                        CakeTemplate = template,
//                        CustomizationJson = json,

//                        // Save personalized message.
//                        PersonalizedMessage = personalizedMessage
//                    });

//                    totalAmount += subtotal;

//                    // Reduce stock for normal cakes only.
//                    if (!isCustomized && cake != null)
//                    {
//                        cake.StockQuantity -= item.Quantity;

//                        if (cake.StockQuantity == 0)
//                            cake.IsAvailable = false;
//                    }
//                }
//            }

//            order.TotalAmount = totalAmount;
//            _context.Orders.Add(order);
//            await _context.SaveChangesAsync();

//            return MapOrderToDto(order);
//        }

//        // GET ONE ORDER FOR LOGGED-IN CUSTOMER

//        public async Task<OrderResponseDto> GetOrderByIdAsync(
//            int userId,
//            int orderId)
//        {
//            var order = await OrdersWithItems()
//                .FirstOrDefaultAsync(o =>
//                    o.Id == orderId &&
//                    o.UserId == userId);

//            if (order == null)
//            {
//                throw new KeyNotFoundException(
//                    "Order not found.");
//            }

//            return MapOrderToDto(order);
//        }


//        // GET ALL ORDERS FOR LOGGED-IN CUSTOMER
//        public async Task<List<OrderResponseDto>> GetMyOrdersAsync(
//            int userId)
//        {
//            var orders = await OrdersWithItems()
//                .Where(o => o.UserId == userId)
//                .OrderByDescending(o => o.OrderDate)
//                .ToListAsync();

//            return orders
//                .Select(MapOrderToDto)
//                .ToList();
//        }


//        // MAP ORDER TO DTO

//        private OrderResponseDto MapOrderToDto(
//            Order order)
//        {
//            var items = order.OrderItems
//                .Select(oi => new OrderItemResponseDto
//                {
//                    OrderItemId = oi.Id,

//                    CakeId = oi.CakeId,

//                    CakeName = oi.Cake?.Name
//                               ?? oi.CakeTemplate?.Name
//                               ?? "Custom Cake",

//                    Quantity = oi.Quantity,

//                    UnitPrice = oi.UnitPrice,

//                    Subtotal = oi.Subtotal,

//                    IsCustomized = oi.CustomizationJson != null,
//                    Customization = oi.CustomizationJson == null
//                        ? null
//                        : JsonSerializer.Deserialize<CustomizationSnapshot>(oi.CustomizationJson)
//                })
//                .ToList();

//            return new OrderResponseDto
//            {
//                OrderId = order.Id,

//                UserId = order.UserId,

//                PhoneNumber = order.PhoneNumber,

//                OrderDate = order.OrderDate,

//                TotalAmount = order.TotalAmount,

//                Status = order.Status,

//                ShippingAddress = order.ShippingAddress,

//                // Delivery Location coordinates
//                Latitude = order.Latitude,
//                Longitude = order.Longitude,

//                PaymentMethod = order.PaymentMethod,

//                PaymentStatus = order.PaymentStatus,

//                Items = items
//            };
//        }
//    }
//}


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


        // GET ALL ORDERS
        // Admin
        public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await OrdersWithItems()
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
            var order = await OrdersWithItems()
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    "Order not found.");
            }

            return MapOrderToDto(order);
        }


        // GET GUEST ORDER BY ID
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


        // UPDATE ORDER STATUS
        // Admin
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


        // CREATE ORDER
        // Registered Customer and Guest Customer
        public async Task<OrderResponseDto> CreateOrderAsync(
            int? userId,
            CreateOrderDto dto)
        {
            // if (!userId.HasValue &&
            //     string.IsNullOrWhiteSpace(dto.PhoneNumber))
            // {
            //     throw new ArgumentException(
            //         "Phone number is required.");
            // }

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

            if (string.IsNullOrWhiteSpace(dto.ShippingAddress))
            {
                throw new ArgumentException(
                    "Shipping address is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.PaymentMethod))
            {
                throw new ArgumentException(
                    "Payment method is required.");
            }

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                PhoneNumber = dto.PhoneNumber?.Trim(),
                ShippingAddress = dto.ShippingAddress.Trim(),
                PaymentMethod = dto.PaymentMethod.Trim(),

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

                        // Validate personalized message
                        personalizedMessage =
                            ValidatePersonalizedMessage(
                                cake,
                                cartItem.PersonalizedMessage);

                        // // Normal cake price
                        // unitPrice = cake.Price;

                        // // Add extra price only when
                        // // a personalized message exists
                        // if (personalizedMessage != null)
                        // {
                        //     unitPrice += cake.MessageAdditionalPrice;
                        // }
                        // Save the message surcharge as an order-time snapshot
messageAdditionalPrice =
    personalizedMessage != null
        ? cake.MessageAdditionalPrice
        : 0m;

// Final unit price includes the message surcharge
unitPrice = cake.Price + messageAdditionalPrice;
                    }


                    // Calculate subtotal
                    decimal subtotal =
                        unitPrice * cartItem.Quantity;


                    // Create order item
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

                        // Save personalized message
                        PersonalizedMessage = personalizedMessage
                    });

                    totalAmount += subtotal;


                    // Reduce stock for normal cakes only
                    if (!isCustomized && cake != null)
                    {
                        cake.StockQuantity -= cartItem.Quantity;

                        if (cake.StockQuantity == 0)
                        {
                            cake.IsAvailable = false;
                        }
                    }
                }

                // Remove purchased cart items
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
                    if (item.Quantity < 1)
                    {
                        throw new ArgumentException(
                            "Quantity must be at least 1.");
                    }

                    var isCustomized = item.Customization != null;

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
                        // Customized cakes do not support
                        // personalized messages.

                        if (!string.IsNullOrWhiteSpace(
                            item.PersonalizedMessage))
                        {
                            throw new InvalidOperationException(
                                "Personalized messages are not available for customized cakes.");
                        }

                        // Create customization snapshot
                        var snapshot =
                            await _snapshotService.CreateSnapshotAsync(
                                item.Customization!);

                        // Calculate price on server
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

                        // Validate personalized message
                        personalizedMessage =
                            ValidatePersonalizedMessage(
                                cake,
                                item.PersonalizedMessage);

                        // // Normal cake price
                        // unitPrice = cake.Price;

                        // // Add additional message price
                        // if (personalizedMessage != null)
                        // {
                        //     unitPrice += cake.MessageAdditionalPrice;
                        // }
                        // Save the message surcharge at order time
messageAdditionalPrice =
    personalizedMessage != null
        ? cake.MessageAdditionalPrice
        : 0m;

// Final unit price includes the surcharge
unitPrice = cake.Price + messageAdditionalPrice;
                    }


                    // Calculate subtotal
                    decimal subtotal =
                        unitPrice * item.Quantity;


                    // Create order item
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

                        // Save personalized message
                        PersonalizedMessage = personalizedMessage
                    });

                    totalAmount += subtotal;


                    // Reduce stock for normal cakes only
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

            // No message provided
            if (string.IsNullOrWhiteSpace(message))
            {
                return null;
            }

            // Check whether admin enabled messages
            if (!cake.AllowMessage)
            {
                throw new InvalidOperationException(
                    $"Personalized messages are not available for '{cake.Name}'.");
            }

            // Check configured maximum length
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

            // Check additional price
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

                    // Return personalized message
                    PersonalizedMessage = oi.PersonalizedMessage
                })
                .ToList();


            return new OrderResponseDto
            {
                OrderId = order.Id,

                // Public GUID for order reference
                PublicId = order.PublicId,

                UserId = order.UserId,

                PhoneNumber = order.PhoneNumber,

                OrderDate = order.OrderDate,

                TotalAmount = order.TotalAmount,

                Status = order.Status,

                ShippingAddress = order.ShippingAddress,

                // Delivery location coordinates
                Latitude = order.Latitude,

                Longitude = order.Longitude,

                PaymentMethod = order.PaymentMethod,

                PaymentStatus = order.PaymentStatus,

                Items = items
            };
        }
    }
}
