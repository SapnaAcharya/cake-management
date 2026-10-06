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
        // Handles BOTH normal and customized cakes.
        // dto.Customization == null  -> normal cake
        // dto.Customization != null  -> customized cake
        public async Task<CartResponseDto> AddToCartAsync(
            int userId,
            AddToCartDto dto)
        {
            var cake = await _context.Cakes
                .FirstOrDefaultAsync(c => c.Id == dto.CakeId);

            if (cake == null)
            {
                throw new KeyNotFoundException(
                    "Cake not found.");
            }

            var isCustomized = dto.Customization != null;

            // Stock/availability apply to ready-made cakes only.
            // Customized cakes are made to order.
            if (!isCustomized)
            {
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
            }

            var cart = await GetOrCreateCartAsync(userId);

            if (isCustomized)
            {
                // Customized cake: always a NEW cart line, never merged
                var snapshot = await _snapshotService
                    .CreateSnapshotAsync(dto.Customization!);

                var customPrice = await _pricing.CalculateAsync(dto.Customization!);

                //var customPrice = await CalculateCustomPriceAsync(snapshot);

                var customItem = new CartItem
                {
                    CartId = cart.Id,
                    CakeId = dto.CakeId,
                    Quantity = dto.Quantity,
                    CakeTemplateId = snapshot.TemplateId,
                    CustomUnitPrice = customPrice,
                    CustomizationJson = _snapshotService.ToJson(snapshot)
                };

                cart.CartItems.Add(customItem);
            }
            else
            {
                // Normal cake: merge with existing NORMAL line
                var existingItem = cart.CartItems
                    .FirstOrDefault(ci =>
                        ci.CakeId == dto.CakeId &&
                        ci.CustomizationJson == null);

                if (existingItem != null)
                {
                    var newQuantity =
                        existingItem.Quantity + dto.Quantity;

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
                        Quantity = dto.Quantity
                    };

                    cart.CartItems.Add(cartItem);
                }
            }

            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(userId);
        }

        // UPDATE CART ITEM
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
                throw new KeyNotFoundException(
                    "Cart item not found.");
            }

            if (cartItem.Cake == null)
            {
                throw new KeyNotFoundException(
                    "Cake not found.");
            }

            // Stock rules apply to normal cakes only
            if (cartItem.CustomizationJson == null)
            {
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
                throw new KeyNotFoundException(
                    "Cart item not found.");
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

        // HELPER: GET OR CREATE CART
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

        // Adjust property names/rates to match your CakeTemplate model
        private async Task<decimal> CalculateCustomPriceAsync(
            CustomizationSnapshot snapshot)
        {
            var template = await _context.CakeTemplates
                .FindAsync(snapshot.TemplateId);

            if (template == null)
            {
                throw new KeyNotFoundException(
                    "Cake template not found.");
            }

            decimal price = template.BasePrice;

            // Example surcharges - change to your real pricing rules
            var extraTiers = Math.Max(0, snapshot.Tiers - template.Tiers);
            price += extraTiers * 25m;
            price += snapshot.Candles * 0.5m;

            return price;
        }

        // MAP CART TO DTO
        private CartResponseDto MapCartToDto(Cart cart)
        {
            var items = cart.CartItems
                .Where(ci => ci.Cake != null)
                .Select(ci =>
                {
                    // Customized lines use CustomUnitPrice,
                    // normal lines use the cake's price
                    var unitPrice = ci.CustomUnitPrice ?? ci.Cake!.Price;

                    return new CartItemResponseDto
                    {
                        CartItemId = ci.Id,
                        CakeId = ci.CakeId,
                        CakeName = ci.Cake!.Name,
                        ImageUrl = ci.Cake.ImageUrl,
                        Price = unitPrice,
                        Quantity = ci.Quantity,
                        Subtotal = unitPrice * ci.Quantity,

                        // New fields for customized cake
                        IsCustomized = ci.CustomizationJson != null,
                        Customization = ci.CustomizationJson == null
                              ? null
                              : JsonSerializer.Deserialize<CustomizationSnapshot>(ci.CustomizationJson)
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