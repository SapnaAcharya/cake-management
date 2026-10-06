using CakeManagementAPI.DTOs.AdminOrder;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminOrderController : ControllerBase
    {
        private readonly IAdminOrderService _adminOrderService;

        public AdminOrderController(
            IAdminOrderService adminOrderService)
        {
            _adminOrderService = adminOrderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders =
                    await _adminOrderService.GetAllOrdersAsync();

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

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(
            int orderId)
        {
            try
            {
                var order =
                    await _adminOrderService.GetOrderByIdAsync(
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

        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            int orderId,
            [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var order =
                    await _adminOrderService
                        .UpdateOrderStatusAsync(
                            orderId,
                            dto.Status);

                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
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
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}