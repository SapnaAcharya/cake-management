using CakeManagementAPI.DTOs.Cake;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CakeManagementAPI.Data;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CakesController : ControllerBase
    {
        private readonly ICakeService _cakeService;

        private readonly AppDbContext _context;

        public CakesController(ICakeService cakeService, AppDbContext context)
        {
            _cakeService = cakeService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1,
            int pageSize = 10,
            int? categoryId = null
            )
        {
            var cakes = await _cakeService.GetAllAsync(pageNumber, pageSize, categoryId);
            return Ok(cakes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cake = await _cakeService.GetByIdAsync(id);

            if (cake == null)
            {
                return NotFound(
                    $"Cake with id {id} was not found.");
            }

            return Ok(cake);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromForm] CreateCakeDto dto)
        {
            try
            {
                var cake = await _cakeService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = cake.Id },
                    cake);
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
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, [FromForm] UpdateCakeDto dto)
            {
            try
            {
                var updated = await _cakeService.UpdateAsync(id, dto);

                if (!updated)
                    {
                    return NotFound(
                        $"Cake with id {id} was not found.");
                }

                return Ok(new
                {
                    message = "Cake updated successfully."
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

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _cakeService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(
                        $"Cake with id {id} was not found.");
                }

                return Ok(new
                {
                    message = "Cake deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured()
        {
            var cakes = await _context.Cakes
                .Where(c => c.IsFeatured)
                .ToListAsync();

            return Ok(cakes);
        }

        [HttpGet("best-sellers")]
        public async Task<IActionResult> GetBestSellers()
        {
            var cakes = await _context.Cakes
                .Where(c => c.IsBestSeller)
                .ToListAsync();

            return Ok(cakes);
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending()
        {
            var cakes = await _context.Cakes
                .Where(c => c.IsTrending)
                .ToListAsync();

            return Ok(cakes);
        }
    }
}