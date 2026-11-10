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

            // Validate delivery coordinates
            if (dto.Latitude.HasValue &&
                (dto.Latitude < -90 || dto.Latitude > 90))
            {
                return BadRequest(new
                {
                    message = "Invalid delivery latitude."
                });
            }

            if (dto.Longitude.HasValue &&
                (dto.Longitude < -180 || dto.Longitude > 180))
            {
                return BadRequest(new
                {
                    message = "Invalid delivery longitude."
                });
            }

            // Latitude and longitude must be provided together
            if (dto.Latitude.HasValue != dto.Longitude.HasValue)
            {
                return BadRequest(new
                {
                    message = "Both latitude and longitude are required."
                });
            }

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

        // Get one order of logged-in customer using PublicId (GUID)
[HttpGet("public/{publicId:guid}")]
[Authorize(Roles = "Customer")]
public async Task<IActionResult> GetOrderByPublicId(Guid publicId)
{
    var userId = GetUserId();

    if (userId == null)
    {
        return Unauthorized();
    }

    try
    {
        var order = await _orderService.GetOrderByPublicIdAsync(
            userId.Value,
            publicId);

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

// Get guest order using PublicId and phone number
// GET /api/Order/guest/public/{publicId}?phoneNumber=9800000000
[HttpGet("guest/public/{publicId:guid}")]
[AllowAnonymous]
public async Task<IActionResult> GetGuestOrderByPublicId(
    Guid publicId,
    [FromQuery] string phoneNumber)
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
        var order = await _orderService.GetGuestOrderByPublicIdAsync(
            publicId,
            phoneNumber);

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
