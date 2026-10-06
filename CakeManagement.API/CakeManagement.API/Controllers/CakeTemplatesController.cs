using CakeManagementAPI.DTOs.Templates;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/templates")]
public class CakeTemplatesController : ControllerBase
{
    private readonly ICakeTemplateService _service;

    public CakeTemplatesController(ICakeTemplateService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var templates = await _service.GetAllAsync();

        return Ok(templates);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var template = await _service.GetByIdAsync(id);

        if (template == null)
            return NotFound();

        return Ok(template);
    }

    [HttpPost("/api/admin/templates")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCakeTemplateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("/api/admin/templates/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCakeTemplateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _service.UpdateAsync(id, dto);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpPost("/api/admin/templates/{id}/images")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddImages(int id, [FromBody] CreateTemplateImageDto dto)
    {
        var updated = await _service.AddImagesAsync(id, dto);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpPost("/api/admin/templates/upload-image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            var url = await _service.SaveTemplateImageAsync(file);

            if (url == null)
            {
                return BadRequest(new { message = "No file was provided." });
            }

            return Ok(new { url });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("/api/admin/templates/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured([FromQuery] int count = 3)
    {
        var featured = await _service.GetFeaturedAsync(count);
        return Ok(featured);
    }
}