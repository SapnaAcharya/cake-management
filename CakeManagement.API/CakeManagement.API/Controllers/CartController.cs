using CakeManagementAPI.DTOs.Cart;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // GET CART
        // GET: api/Cart
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var cart = await _cartService.GetCartAsync(userId.Value);

                return Ok(cart);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // ADD TO CART
        // POST: api/Cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(
            AddToCartDto dto)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var cart = await _cartService.AddToCartAsync(
                    userId.Value,
                    dto);

                return Ok(cart);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // add to cart for the customize cake
        [HttpPost("add-customized")]
        public async Task<IActionResult> AddCustomizedToCart(
           AddToCartDto dto)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            if (dto.Customization == null)
            {
                return BadRequest(new { message = "Customization is required." });
            }

            try
            {
                var cart = await _cartService
                    .AddToCartAsync(
                        userId.Value,
                        dto);

                return Ok(cart);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // UPDATE CART ITEM
        // PUT: api/Cart/items/{cartItemId}
        [HttpPut("items/{cartItemId}")]
        public async Task<IActionResult> UpdateCartItem(
            int cartItemId,
            [FromBody] int quantity)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var cart = await _cartService.UpdateCartItemAsync(
                    userId.Value,
                    cartItemId,
                    quantity);

                return Ok(cart);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // REMOVE CART ITEM
        // DELETE: api/Cart/items/{cartItemId}
        [HttpDelete("items/{cartItemId}")]
        public async Task<IActionResult> RemoveCartItem(
            int cartItemId)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                await _cartService.RemoveCartItemAsync(
                    userId.Value,
                    cartItemId);

                return Ok(new
                {
                    message = "Cart item removed successfully."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        // CLEAR CART
        // DELETE: api/Cart/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            await _cartService.ClearCartAsync(userId.Value);

            return Ok(new
            {
                message = "Cart cleared successfully."
            });
        }

        // GET USER ID FROM JWT
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return null;
            }

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return null;
            }

            return userId;
        }
    }
}