using CakeManagementAPI.DTOs.AdminOrder;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminOrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // GET api/admin/order
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    // GET api/admin/order/5 
    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(int orderId)
    {
        try
        {
            var order = await _orderService.GetOrderByIdForAdminAsync(orderId);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // PUT api/admin/order/5/status
    [HttpPut("{orderId}/status")]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(orderId, dto.Status);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}