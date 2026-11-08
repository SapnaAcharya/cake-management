// //using CakeManagementAPI.Data;
// //using CakeManagementAPI.DTOs.Cart;
// //using CakeManagementAPI.Models;
// //using CakeManagementAPI.Services.Interfaces;
// //using Microsoft.EntityFrameworkCore;
// //using System.Text.Json;

// //namespace CakeManagementAPI.Services
// //{
// //    public class CartService : ICartService
// //    {
// //        private readonly AppDbContext _context;
// //        private readonly ICustomizationSnapshotService _snapshotService;
// //        private readonly CakePricingService _pricing;
// //        public CartService(
// //            AppDbContext context,
// //            ICustomizationSnapshotService snapshotService,
// //            CakePricingService pricing)
// //        {
// //            _context = context;
// //            _snapshotService = snapshotService;
// //            _pricing = pricing;
// //        }

// //        // GET CART
// //        public async Task<CartResponseDto> GetCartAsync(int userId)
// //        {
// //            var cart = await _context.Carts
// //                .Include(c => c.CartItems)
// //                .ThenInclude(ci => ci.Cake)
// //                .Include(c => c.CartItems)
// //                .ThenInclude(ci => ci.CakeTemplate)
// //                .FirstOrDefaultAsync(c => c.UserId == userId);

// //            if (cart == null)
// //            {
// //                cart = new Cart
// //                {
// //                    UserId = userId
// //                };

// //                _context.Carts.Add(cart);

// //                await _context.SaveChangesAsync();
// //            }

// //            return MapCartToDto(cart);
// //        }

// //        // ADD TO CART
// //        // Handles BOTH normal and customized cakes.
// //        // dto.Customization == null  -> normal cake (CakeId required)
// //        // dto.Customization != null  -> customized cake (no CakeId, uses template)
// //        public async Task<CartResponseDto> AddToCartAsync(
// //            int userId,
// //            AddToCartDto dto)
// //        {
// //            var isCustomized = dto.Customization != null;

// //            var cart = await GetOrCreateCartAsync(userId);

// //            if (isCustomized)
// //            {
// //                // Customized cake: identified by template, no CakeId,
// //                // no stock rules (made to order).
// //                // Always a NEW cart line, never merged.
// //                var snapshot = await _snapshotService
// //                    .CreateSnapshotAsync(dto.Customization!);

// //                var customPrice = await _pricing.CalculateAsync(dto.Customization!);

// //                var customItem = new CartItem
// //                {
// //                    CartId = cart.Id,
// //                    CakeId = null,
// //                    Quantity = dto.Quantity,
// //                    CakeTemplateId = snapshot.TemplateId,
// //                    CustomUnitPrice = customPrice,
// //                    CustomizationJson = _snapshotService.ToJson(snapshot)
// //                };

// //                cart.CartItems.Add(customItem);
// //            }
// //            else
// //            {
// //                // Normal cake: CakeId is required
// //                if (dto.CakeId == null)
// //                {
// //                    throw new ArgumentException(
// //                        "CakeId is required for normal cakes.");
// //                }

// //                var cake = await _context.Cakes
// //                    .FirstOrDefaultAsync(c => c.Id == dto.CakeId.Value);

// //                if (cake == null)
// //                {
// //                    throw new KeyNotFoundException(
// //                        "Cake not found.");
// //                }

// //                if (!cake.IsAvailable)
// //                {
// //                    throw new InvalidOperationException(
// //                        "This cake is currently unavailable.");
// //                }

// //                if (dto.Quantity > cake.StockQuantity)
// //                {
// //                    throw new InvalidOperationException(
// //                        "Requested quantity is greater than available stock.");
// //                }

// //                // Merge with existing NORMAL line
// //                var existingItem = cart.CartItems
// //                    .FirstOrDefault(ci =>
// //                        ci.CakeId == dto.CakeId &&
// //                        ci.CustomizationJson == null);

// //                if (existingItem != null)
// //                {
// //                    var newQuantity =
// //                        existingItem.Quantity + dto.Quantity;

// //                    if (newQuantity > cake.StockQuantity)
// //                    {
// //                        throw new InvalidOperationException(
// //                            "Requested quantity is greater than available stock.");
// //                    }

// //                    existingItem.Quantity = newQuantity;
// //                }
// //                else
// //                {
// //                    var cartItem = new CartItem
// //                    {
// //                        CartId = cart.Id,
// //                        CakeId = dto.CakeId,
// //                        Quantity = dto.Quantity
// //                    };

// //                    cart.CartItems.Add(cartItem);
// //                }
// //            }

// //            cart.UpdatedAt = DateTime.UtcNow;

// //            await _context.SaveChangesAsync();

// //            return await GetCartAsync(userId);
// //        }

// //        // UPDATE CART ITEM
// //        public async Task<CartResponseDto> UpdateCartItemAsync(
// //            int userId,
// //            int cartItemId,
// //            int quantity)
// //        {
// //            if (quantity < 1)
// //            {
// //                throw new ArgumentException(
// //                    "Quantity must be at least 1.");
// //            }

// //            var cartItem = await _context.CartItems
// //                .Include(ci => ci.Cart)
// //                .Include(ci => ci.Cake)
// //                .FirstOrDefaultAsync(ci =>
// //                    ci.Id == cartItemId &&
// //                    ci.Cart!.UserId == userId);

// //            if (cartItem == null)
// //            {
// //                throw new KeyNotFoundException(
// //                    "Cart item not found.");
// //            }

// //            // Stock rules apply to normal cakes only
// //            if (cartItem.CustomizationJson == null)
// //            {
// //                if (cartItem.Cake == null)
// //                {
// //                    throw new KeyNotFoundException(
// //                        "Cake not found.");
// //                }

// //                if (!cartItem.Cake.IsAvailable)
// //                {
// //                    throw new InvalidOperationException(
// //                        "This cake is currently unavailable.");
// //                }

// //                if (quantity > cartItem.Cake.StockQuantity)
// //                {
// //                    throw new InvalidOperationException(
// //                        "Requested quantity is greater than available stock.");
// //                }
// //            }

// //            cartItem.Quantity = quantity;

// //            cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

// //            await _context.SaveChangesAsync();

// //            return await GetCartAsync(userId);
// //        }

// //        // REMOVE CART ITEM
// //        public async Task RemoveCartItemAsync(
// //            int userId,
// //            int cartItemId)
// //        {
// //            var cartItem = await _context.CartItems
// //                .Include(ci => ci.Cart)
// //                .FirstOrDefaultAsync(ci =>
// //                    ci.Id == cartItemId &&
// //                    ci.Cart!.UserId == userId);

// //            if (cartItem == null)
// //            {
// //                throw new KeyNotFoundException(
// //                    "Cart item not found.");
// //            }

// //            cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

// //            _context.CartItems.Remove(cartItem);

// //            await _context.SaveChangesAsync();
// //        }

// //        // CLEAR CART
// //        public async Task ClearCartAsync(int userId)
// //        {
// //            var cart = await _context.Carts
// //                .Include(c => c.CartItems)
// //                .FirstOrDefaultAsync(c => c.UserId == userId);

// //            if (cart == null)
// //            {
// //                return;
// //            }

// //            _context.CartItems.RemoveRange(cart.CartItems);

// //            cart.UpdatedAt = DateTime.UtcNow;

// //            await _context.SaveChangesAsync();
// //        }

// //        // HELPER: GET OR CREATE CART
// //        private async Task<Cart> GetOrCreateCartAsync(int userId)
// //        {
// //            var cart = await _context.Carts
// //                .Include(c => c.CartItems)
// //                .FirstOrDefaultAsync(c => c.UserId == userId);

// //            if (cart == null)
// //            {
// //                cart = new Cart
// //                {
// //                    UserId = userId
// //                };

// //                _context.Carts.Add(cart);

// //                await _context.SaveChangesAsync();
// //            }

// //            return cart;
// //        }

// //        // Adjust property names/rates to match your CakeTemplate model
// //        private async Task<decimal> CalculateCustomPriceAsync(
// //            CustomizationSnapshot snapshot)
// //        {
// //            var template = await _context.CakeTemplates
// //                .FindAsync(snapshot.TemplateId);

// //            if (template == null)
// //            {
// //                throw new KeyNotFoundException(
// //                    "Cake template not found.");
// //            }

// //            decimal price = template.BasePrice;

// //            // Example surcharges - change to your real pricing rules
// //            var extraTiers = Math.Max(0, snapshot.Tiers - template.Tiers);
// //            price += extraTiers * 25m;
// //            price += snapshot.Candles * 0.5m;

// //            return price;
// //        }

// //        // MAP CART TO DTO
// //        private CartResponseDto MapCartToDto(Cart cart)
// //        {
// //            var items = cart.CartItems
// //                .Select(ci =>
// //                {
// //                    // Customized lines use CustomUnitPrice,
// //                    // normal lines use the cake's price
// //                    var unitPrice = ci.CustomUnitPrice ?? ci.Cake?.Price ?? 0m;

// //                    return new CartItemResponseDto
// //                    {
// //                        CartItemId = ci.Id,
// //                        CakeId = ci.CakeId,

// //                        CakeName = ci.Cake?.Name
// //                                   ?? ci.CakeTemplate?.Name
// //                                   ?? "Custom Cake",

// //                        ImageUrl = ci.Cake?.ImageUrl ?? string.Empty,
// //                        Price = unitPrice,
// //                        Quantity = ci.Quantity,
// //                        Subtotal = unitPrice * ci.Quantity,

// //                        // Customized cake fields
// //                        IsCustomized = ci.CustomizationJson != null,
// //                        Customization = ci.CustomizationJson == null
// //                              ? null
// //                              : JsonSerializer.Deserialize<CustomizationSnapshot>(ci.CustomizationJson)
// //                    };
// //                })
// //                .ToList();

// //            return new CartResponseDto
// //            {
// //                CartId = cart.Id,
// //                UserId = cart.UserId,
// //                Items = items,
// //                TotalAmount = items.Sum(i => i.Subtotal)
// //            };
// //        }
// //    }
// //}


// using CakeManagementAPI.Data;
// using CakeManagementAPI.DTOs.Cart;
// using CakeManagementAPI.Models;
// using CakeManagementAPI.Services.Interfaces;
// using Microsoft.EntityFrameworkCore;
// using System.Text.Json;

// namespace CakeManagementAPI.Services
// {
//     public class CartService : ICartService
//     {
//         private readonly AppDbContext _context;
//         private readonly ICustomizationSnapshotService _snapshotService;
//         private readonly CakePricingService _pricing;

//         public CartService(
//             AppDbContext context,
//             ICustomizationSnapshotService snapshotService,
//             CakePricingService pricing)
//         {
//             _context = context;
//             _snapshotService = snapshotService;
//             _pricing = pricing;
//         }

//         // GET CART
//         public async Task<CartResponseDto> GetCartAsync(int userId)
//         {
//             var cart = await _context.Carts
//                 .Include(c => c.CartItems)
//                     .ThenInclude(ci => ci.Cake)
//                 .Include(c => c.CartItems)
//                     .ThenInclude(ci => ci.CakeTemplate)
//                 .FirstOrDefaultAsync(c => c.UserId == userId);

//             if (cart == null)
//             {
//                 cart = new Cart
//                 {
//                     UserId = userId
//                 };

//                 _context.Carts.Add(cart);
//                 await _context.SaveChangesAsync();
//             }

//             return MapCartToDto(cart);
//         }

//         // ADD TO CART
//         // Handles normal and customized cakes.
//         public async Task<CartResponseDto> AddToCartAsync(
//             int userId,
//             AddToCartDto dto)
//         {
//             var isCustomized = dto.Customization != null;

//             var cart = await GetOrCreateCartAsync(userId);

//             if (isCustomized)
//             {
//                 // Customized cakes always create a separate cart line.
//                 var snapshot = await _snapshotService
//                     .CreateSnapshotAsync(dto.Customization!);

//                 var customPrice = await _pricing.CalculateAsync(
//                     dto.Customization!);

//                 var customItem = new CartItem
//                 {
//                     CartId = cart.Id,
//                     CakeId = null,
//                     Quantity = dto.Quantity,
//                     CakeTemplateId = snapshot.TemplateId,
//                     CustomUnitPrice = customPrice,
//                     CustomizationJson = _snapshotService.ToJson(snapshot),
//                     PersonalizedMessage = null
//                 };

//                 cart.CartItems.Add(customItem);
//             }
//             else
//             {
//                 if (dto.CakeId == null)
//                 {
//                     throw new ArgumentException(
//                         "CakeId is required for normal cakes.");
//                 }

//                 var cake = await _context.Cakes
//                     .FirstOrDefaultAsync(c => c.Id == dto.CakeId.Value);

//                 if (cake == null)
//                 {
//                     throw new KeyNotFoundException("Cake not found.");
//                 }

//                 if (!cake.IsAvailable)
//                 {
//                     throw new InvalidOperationException(
//                         "This cake is currently unavailable.");
//                 }

//                 if (dto.Quantity > cake.StockQuantity)
//                 {
//                     throw new InvalidOperationException(
//                         "Requested quantity is greater than available stock.");
//                 }

//                 // Merge with an existing normal cake line.
//                 var existingItem = cart.CartItems.FirstOrDefault(ci =>
//                     ci.CakeId == dto.CakeId &&
//                     ci.CustomizationJson == null);

//                 if (existingItem != null)
//                 {
//                     var newQuantity = existingItem.Quantity + dto.Quantity;

//                     if (newQuantity > cake.StockQuantity)
//                     {
//                         throw new InvalidOperationException(
//                             "Requested quantity is greater than available stock.");
//                     }

//                     existingItem.Quantity = newQuantity;
//                 }
//                 else
//                 {
//                     var cartItem = new CartItem
//                     {
//                         CartId = cart.Id,
//                         CakeId = dto.CakeId,
//                         Quantity = dto.Quantity,
//                         PersonalizedMessage = null
//                     };

//                     cart.CartItems.Add(cartItem);
//                 }
//             }

//             cart.UpdatedAt = DateTime.UtcNow;

//             await _context.SaveChangesAsync();

//             return await GetCartAsync(userId);
//         }

//         // UPDATE CART ITEM QUANTITY
//         public async Task<CartResponseDto> UpdateCartItemAsync(
//             int userId,
//             int cartItemId,
//             int quantity)
//         {
//             if (quantity < 1)
//             {
//                 throw new ArgumentException(
//                     "Quantity must be at least 1.");
//             }

//             var cartItem = await _context.CartItems
//                 .Include(ci => ci.Cart)
//                 .Include(ci => ci.Cake)
//                 .FirstOrDefaultAsync(ci =>
//                     ci.Id == cartItemId &&
//                     ci.Cart!.UserId == userId);

//             if (cartItem == null)
//             {
//                 throw new KeyNotFoundException("Cart item not found.");
//             }

//             // Stock rules apply to normal cakes only.
//             if (cartItem.CustomizationJson == null)
//             {
//                 if (cartItem.Cake == null)
//                 {
//                     throw new KeyNotFoundException("Cake not found.");
//                 }

//                 if (!cartItem.Cake.IsAvailable)
//                 {
//                     throw new InvalidOperationException(
//                         "This cake is currently unavailable.");
//                 }

//                 if (quantity > cartItem.Cake.StockQuantity)
//                 {
//                     throw new InvalidOperationException(
//                         "Requested quantity is greater than available stock.");
//                 }
//             }

//             cartItem.Quantity = quantity;
//             cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

//             await _context.SaveChangesAsync();

//             return await GetCartAsync(userId);
//         }

//         // UPDATE PERSONALIZED MESSAGE
//         public async Task<CartResponseDto> UpdatePersonalizedMessageAsync(
//             int userId,
//             int cartItemId,
//             string? personalizedMessage)
//         {
//             var cartItem = await _context.CartItems
//                 .Include(ci => ci.Cart)
//                 .Include(ci => ci.Cake)
//                 .FirstOrDefaultAsync(ci =>
//                     ci.Id == cartItemId &&
//                     ci.Cart!.UserId == userId);

//             if (cartItem == null)
//             {
//                 throw new KeyNotFoundException("Cart item not found.");
//             }

//             // Personalized messages are not supported for customized cakes.
//             if (cartItem.CustomizationJson != null)
//             {
//                 throw new InvalidOperationException(
//                     "Personalized messages are not available for customized cakes.");
//             }

//             if (cartItem.Cake == null)
//             {
//                 throw new KeyNotFoundException("Cake not found.");
//             }

//             var cake = cartItem.Cake;

//             // An empty message removes any previously saved message.
//             var message = personalizedMessage?.Trim();

//             if (string.IsNullOrWhiteSpace(message))
//             {
//                 cartItem.PersonalizedMessage = null;
//             }
//             else
//             {
//                 if (!cake.AllowMessage)
//                 {
//                     throw new InvalidOperationException(
//                         "Personalized messages are not available for this cake.");
//                 }

//                 if (cake.MaxMessageLength < 1)
//                 {
//                     throw new InvalidOperationException(
//                         "The personalized message settings for this cake are invalid.");
//                 }

//                 //if (message.Length > cake.MaxMessageLength)
//                 //{
//                 //    throw new ArgumentException(
//                 //        $"Your message cannot exceed {cake.MaxMessageLength} characters.");
//                 //}

//                 //cartItem.PersonalizedMessage = message;
//                 if (message.Length > cake.MaxMessageLength)
//                 {
//                     throw new ArgumentException(
//                         $"Your message cannot exceed {cake.MaxMessageLength} characters.");
//                 }

//                 if (cake.MessageAdditionalPrice < 0)
//                 {
//                     throw new InvalidOperationException(
//                         "The personalized message additional price is invalid.");
//                 }

//                 cartItem.PersonalizedMessage = message;
//             }

//             cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

//             await _context.SaveChangesAsync();

//             return await GetCartAsync(userId);
//         }

//         // REMOVE CART ITEM
//         public async Task RemoveCartItemAsync(
//             int userId,
//             int cartItemId)
//         {
//             var cartItem = await _context.CartItems
//                 .Include(ci => ci.Cart)
//                 .FirstOrDefaultAsync(ci =>
//                     ci.Id == cartItemId &&
//                     ci.Cart!.UserId == userId);

//             if (cartItem == null)
//             {
//                 throw new KeyNotFoundException("Cart item not found.");
//             }

//             cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

//             _context.CartItems.Remove(cartItem);

//             await _context.SaveChangesAsync();
//         }

//         // CLEAR CART
//         public async Task ClearCartAsync(int userId)
//         {
//             var cart = await _context.Carts
//                 .Include(c => c.CartItems)
//                 .FirstOrDefaultAsync(c => c.UserId == userId);

//             if (cart == null)
//             {
//                 return;
//             }

//             _context.CartItems.RemoveRange(cart.CartItems);

//             cart.UpdatedAt = DateTime.UtcNow;

//             await _context.SaveChangesAsync();
//         }

//         // GET OR CREATE CART
//         private async Task<Cart> GetOrCreateCartAsync(int userId)
//         {
//             var cart = await _context.Carts
//                 .Include(c => c.CartItems)
//                 .FirstOrDefaultAsync(c => c.UserId == userId);

//             if (cart == null)
//             {
//                 cart = new Cart
//                 {
//                     UserId = userId
//                 };

//                 _context.Carts.Add(cart);

//                 await _context.SaveChangesAsync();
//             }

//             return cart;
//         }

//         // MAP CART TO RESPONSE DTO
//         private CartResponseDto MapCartToDto(Cart cart)
//         {
//             var items = cart.CartItems
//                 .Select(ci =>
//                 {
//                     var isCustomized = ci.CustomizationJson != null;
//                     var cake = ci.Cake;

//                     // Customized cakes use their calculated custom price.
//                     // Normal cakes use the database cake price.
//                     var unitPrice = isCustomized
//                         ? ci.CustomUnitPrice ?? 0m
//                         : cake?.Price ?? 0m;

//                     // Add the message surcharge only when a message exists.
//                     if (!isCustomized &&
//                         !string.IsNullOrWhiteSpace(ci.PersonalizedMessage) &&
//                         cake != null)
//                     {
//                         unitPrice += cake.MessageAdditionalPrice;
//                     }

//                     return new CartItemResponseDto
//                     {
//                         CartItemId = ci.Id,
//                         CakeId = ci.CakeId,

//                         CakeName = cake?.Name
//                             ?? ci.CakeTemplate?.Name
//                             ?? "Custom Cake",

//                         ImageUrl = cake?.ImageUrl ?? string.Empty,

//                         Price = unitPrice,
//                         Quantity = ci.Quantity,
//                         Subtotal = unitPrice * ci.Quantity,

//                         IsCustomized = isCustomized,

//                         Customization = ci.CustomizationJson == null
//                             ? null
//                             : JsonSerializer.Deserialize<CustomizationSnapshot>(
//                                 ci.CustomizationJson),

//                         // Personalized message
//                         PersonalizedMessage = ci.PersonalizedMessage,

//                         // Cake-specific message settings.
//                         // Customized cakes never expose these settings.
//                         AllowMessage = !isCustomized && cake?.AllowMessage == true,

//                         MessageLabel = !isCustomized
//                             ? cake?.MessageLabel
//                             : null,

//                         MessagePlaceholder = !isCustomized
//                             ? cake?.MessagePlaceholder
//                             : null,

//                         MaxMessageLength = !isCustomized
//                             ? cake?.MaxMessageLength ?? 0
//                             : 0,

//                         MessageAdditionalPrice = !isCustomized
//                             ? cake?.MessageAdditionalPrice ?? 0m
//                             : 0m
//                     };
//                 })
//                 .ToList();

//             return new CartResponseDto
//             {
//                 CartId = cart.Id,
//                 UserId = cart.UserId,
//                 Items = items,
//                 TotalAmount = items.Sum(i => i.Subtotal)
//             };
//         }
//     }
// }


using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Cart;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CakeManagementAPI.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly ICustomizationSnapshotService _snapshotService;
        private readonly CakePricingService _pricing;

        public CartService(
            AppDbContext context,
            ICustomizationSnapshotService snapshotService,
            CakePricingService pricing)
        {
            _context = context;
            _snapshotService = snapshotService;
            _pricing = pricing;
        }

        // GET CART
        public async Task<CartResponseDto> GetCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Cake)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.CakeTemplate)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId
                };

                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return MapCartToDto(cart);
        }

        // ADD TO CART
        // Handles normal and customized cakes.
        public async Task<CartResponseDto> AddToCartAsync(
            int userId,
            AddToCartDto dto)
        {
            var isCustomized = dto.Customization != null;

            var cart = await GetOrCreateCartAsync(userId);

            // CUSTOMIZED CAKES
            if (isCustomized)
            {
                // Customized cakes do not support personalized messages.
                if (!string.IsNullOrWhiteSpace(dto.PersonalizedMessage))
                {
                    throw new InvalidOperationException(
                        "Personalized messages are not available for customized cakes.");
                }

                // Customized cakes always create a separate cart line.
                var snapshot = await _snapshotService
                    .CreateSnapshotAsync(dto.Customization!);

                var customPrice = await _pricing.CalculateAsync(
                    dto.Customization!);

                var customItem = new CartItem
                {
                    CartId = cart.Id,
                    CakeId = null,
                    Quantity = dto.Quantity,
                    CakeTemplateId = snapshot.TemplateId,
                    CustomUnitPrice = customPrice,
                    CustomizationJson = _snapshotService.ToJson(snapshot),
                    PersonalizedMessage = null
                };

                cart.CartItems.Add(customItem);
            }
            // NORMAL CAKES
            else
            {
                if (dto.CakeId == null)
                {
                    throw new ArgumentException(
                        "CakeId is required for normal cakes.");
                }

                var cake = await _context.Cakes
                    .FirstOrDefaultAsync(c => c.Id == dto.CakeId.Value);

                if (cake == null)
                {
                    throw new KeyNotFoundException("Cake not found.");
                }

                if (!cake.IsAvailable)
                {
                    throw new InvalidOperationException(
                        "This cake is currently unavailable.");
                }

                if (dto.Quantity > cake.StockQuantity)
                {
                    throw new InvalidOperationException(
                        "Requested quantity is greater than available stock.");
                }

                // Validate personalized message.
                var message = dto.PersonalizedMessage?.Trim();

                if (!string.IsNullOrWhiteSpace(message))
                {
                    if (!cake.AllowMessage)
                    {
                        throw new InvalidOperationException(
                            "Personalized messages are not available for this cake.");
                    }

                    if (cake.MaxMessageLength < 1)
                    {
                        throw new InvalidOperationException(
                            "The personalized message settings for this cake are invalid.");
                    }

                    if (message.Length > cake.MaxMessageLength)
                    {
                        throw new ArgumentException(
                            $"Your message cannot exceed {cake.MaxMessageLength} characters.");
                    }

                    if (cake.MessageAdditionalPrice < 0)
                    {
                        throw new InvalidOperationException(
                            "The personalized message additional price is invalid.");
                    }
                }
                else
                {
                    message = null;
                }

                // Merge only when both the cake and message are identical.
                var existingItem = cart.CartItems.FirstOrDefault(ci =>
                    ci.CakeId == dto.CakeId &&
                    ci.CustomizationJson == null &&
                    (ci.PersonalizedMessage ?? "") == (message ?? ""));

                if (existingItem != null)
                {
                    var newQuantity = existingItem.Quantity + dto.Quantity;

                    if (newQuantity > cake.StockQuantity)
                    {
                        throw new InvalidOperationException(
                            "Requested quantity is greater than available stock.");
                    }

                    existingItem.Quantity = newQuantity;
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        CakeId = dto.CakeId,
                        Quantity = dto.Quantity,
                        PersonalizedMessage = message
                    };

                    cart.CartItems.Add(cartItem);
                }
            }

            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(userId);
        }

        // UPDATE CART ITEM QUANTITY
        public async Task<CartResponseDto> UpdateCartItemAsync(
            int userId,
            int cartItemId,
            int quantity)
        {
            if (quantity < 1)
            {
                throw new ArgumentException(
                    "Quantity must be at least 1.");
            }

            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Cake)
                .FirstOrDefaultAsync(ci =>
                    ci.Id == cartItemId &&
                    ci.Cart!.UserId == userId);

            if (cartItem == null)
            {
                throw new KeyNotFoundException("Cart item not found.");
            }

            // Stock rules apply to normal cakes only.
            if (cartItem.CustomizationJson == null)
            {
                if (cartItem.Cake == null)
                {
                    throw new KeyNotFoundException("Cake not found.");
                }

                if (!cartItem.Cake.IsAvailable)
                {
                    throw new InvalidOperationException(
                        "This cake is currently unavailable.");
                }

                if (quantity > cartItem.Cake.StockQuantity)
                {
                    throw new InvalidOperationException(
                        "Requested quantity is greater than available stock.");
                }
            }

            cartItem.Quantity = quantity;
            cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(userId);
        }

        // UPDATE PERSONALIZED MESSAGE
        public async Task<CartResponseDto> UpdatePersonalizedMessageAsync(
            int userId,
            int cartItemId,
            string? personalizedMessage)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Cake)
                .FirstOrDefaultAsync(ci =>
                    ci.Id == cartItemId &&
                    ci.Cart!.UserId == userId);

            if (cartItem == null)
            {
                throw new KeyNotFoundException("Cart item not found.");
            }

            // Customized cakes cannot have personalized messages.
            if (cartItem.CustomizationJson != null)
            {
                throw new InvalidOperationException(
                    "Personalized messages are not available for customized cakes.");
            }

            if (cartItem.Cake == null)
            {
                throw new KeyNotFoundException("Cake not found.");
            }

            var cake = cartItem.Cake;

            // Trim the message.
            var message = personalizedMessage?.Trim();

            // Empty message removes the previously saved message.
            if (string.IsNullOrWhiteSpace(message))
            {
                cartItem.PersonalizedMessage = null;
            }
            else
            {
                if (!cake.AllowMessage)
                {
                    throw new InvalidOperationException(
                        "Personalized messages are not available for this cake.");
                }

                if (cake.MaxMessageLength < 1)
                {
                    throw new InvalidOperationException(
                        "The personalized message settings for this cake are invalid.");
                }

                if (message.Length > cake.MaxMessageLength)
                {
                    throw new ArgumentException(
                        $"Your message cannot exceed {cake.MaxMessageLength} characters.");
                }

                if (cake.MessageAdditionalPrice < 0)
                {
                    throw new InvalidOperationException(
                        "The personalized message additional price is invalid.");
                }

                cartItem.PersonalizedMessage = message;
            }

            cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(userId);
        }

        // REMOVE CART ITEM
        public async Task RemoveCartItemAsync(
            int userId,
            int cartItemId)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci =>
                    ci.Id == cartItemId &&
                    ci.Cart!.UserId == userId);

            if (cartItem == null)
            {
                throw new KeyNotFoundException("Cart item not found.");
            }

            cartItem.Cart!.UpdatedAt = DateTime.UtcNow;

            _context.CartItems.Remove(cartItem);

            await _context.SaveChangesAsync();
        }

        // CLEAR CART
        public async Task ClearCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return;
            }

            _context.CartItems.RemoveRange(cart.CartItems);

            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // GET OR CREATE CART
        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId
                };

                _context.Carts.Add(cart);

                await _context.SaveChangesAsync();
            }

            return cart;
        }

        // MAP CART TO RESPONSE DTO
        private CartResponseDto MapCartToDto(Cart cart)
        {
            var items = cart.CartItems
                .Select(ci =>
                {
                    var isCustomized = ci.CustomizationJson != null;
                    var cake = ci.Cake;

                    // Customized cakes use their calculated custom price.
                    // Normal cakes use the database cake price.
                    var unitPrice = isCustomized
                        ? ci.CustomUnitPrice ?? 0m
                        : cake?.Price ?? 0m;

                    // Add the message surcharge only when a message exists.
                    if (!isCustomized &&
                        !string.IsNullOrWhiteSpace(ci.PersonalizedMessage) &&
                        cake != null)
                    {
                        unitPrice += cake.MessageAdditionalPrice;
                    }

                    return new CartItemResponseDto
                    {
                        CartItemId = ci.Id,
                        CakeId = ci.CakeId,

                        CakeName = cake?.Name
                            ?? ci.CakeTemplate?.Name
                            ?? "Custom Cake",

                        ImageUrl = cake?.ImageUrl ?? string.Empty,

                        Price = unitPrice,
                        Quantity = ci.Quantity,
                        Subtotal = unitPrice * ci.Quantity,

                        IsCustomized = isCustomized,

                        Customization = ci.CustomizationJson == null
                            ? null
                            : JsonSerializer.Deserialize<CustomizationSnapshot>(
                                ci.CustomizationJson),

                        // Personalized message
                        PersonalizedMessage = ci.PersonalizedMessage,

                        // Cake-specific message settings.
                        // Customized cakes never expose these settings.
                        AllowMessage = !isCustomized && cake?.AllowMessage == true,

                        MessageLabel = !isCustomized
                            ? cake?.MessageLabel
                            : null,

                        MessagePlaceholder = !isCustomized
                            ? cake?.MessagePlaceholder
                            : null,

                        MaxMessageLength = !isCustomized
                            ? cake?.MaxMessageLength ?? 0
                            : 0,

                        MessageAdditionalPrice = !isCustomized
                            ? cake?.MessageAdditionalPrice ?? 0m
                            : 0m
                    };
                })
                .ToList();

            return new CartResponseDto
            {
                CartId = cart.Id,
                UserId = cart.UserId,
                Items = items,
                TotalAmount = items.Sum(i => i.Subtotal)
            };
        }
    }
}
