using CakeManagementAPI.DTOs.Decoration;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/decorations")]
    public class DecorationController : ControllerBase
    {
        private readonly IDecorationService _decorationService;

        public DecorationController(IDecorationService decorationService)
        {
            _decorationService = decorationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _decorationService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _decorationService.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var result = await _decorationService.GetByCategoryAsync(category);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateDecorationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            try
            {
                var result = await _decorationService.CreateAsync(dto);


                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.Id },
                    result
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromForm] string? category)
        {
            try
            {
                var url = await _decorationService.SaveDecorationImageAsync(file, category);

                if (url == null)
                    return BadRequest(new { message = "No file was provided." });

                return Ok(new { url });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdateDecorationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _decorationService.UpdateAsync(id, dto);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _decorationService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}