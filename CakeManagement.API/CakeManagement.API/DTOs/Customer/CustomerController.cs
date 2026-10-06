using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Customer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomerController(AppDbContext context)
        {
            _context = context;
        }

        // GET CUSTOMER PROFILE
        // GET: api/Customer/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var profile = new CustomerProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address
            };

            return Ok(profile);
        }

        // UPDATE CUSTOMER PROFILE
        // PUT: api/Customer/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
            CustomerProfileDto dto)
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            user.Name = dto.Name.Trim();
            user.Phone = dto.Phone;
            user.Address = dto.Address;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully."
            });
        }
    }
}