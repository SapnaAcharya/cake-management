using CakeManagementAPI.DTOs.Order;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // Create order from customer's cart
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateOrderDto dto)
        {
            int? userId = GetUserId();

            try
            {
                var order = await _orderService.CreateOrderAsync(
                    userId,
                    dto);

                return Ok(order);
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

        // Get all orders of logged-in customer
        [HttpGet]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var orders = await _orderService.GetMyOrdersAsync(
                    userId.Value);

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // Get one order of logged-in customer
        [HttpGet("{orderId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetOrderById(
            int orderId)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var order = await _orderService.GetOrderByIdAsync(
                    userId.Value,
                    orderId);

                return Ok(order);
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

        // Get /api/Order/guest/{id}?phoneNumber=?
        [HttpGet("guest/{id}")]
        public async Task<IActionResult> GetGuestOrderById(
            int id, [FromQuery] string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                return BadRequest(new
                {
                    message = "Phone number is required."
                });
            }

            try
            {
                var order = await _orderService.GetGuestOrderByIdAsync(
                    id, phoneNumber);

                return Ok(order);
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

        // Get logged-in customer's ID from JWT
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return null;
            }

            if (!int.TryParse(
                userIdClaim,
                out var userId))
            {
                return null;
            }

            return userId;
        }
    }
}
