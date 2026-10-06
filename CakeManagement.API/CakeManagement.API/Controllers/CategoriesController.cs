using CakeManagementAPI.DTOs.Category;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(
            ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();

            return Ok(categories);
        }

        // GET: api/Categories/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound(
                    $"Category with id {id} was not found.");
            }

            return Ok(category);
        }

        // POST: api/Categories
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateCategoryDto dto)
        {
            try
            {
                var category =
                    await _categoryService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = category.Id },
                    new
                    {
                        message = "Category created successfully.",
                        category
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

        // PUT: api/Categories/1
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateCategoryDto dto)
        {
            try
            {
                var updated =
                    await _categoryService.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(
                        $"Category with id {id} was not found.");
                }

                return Ok(new
                {
                    message = "Category updated successfully."
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

        // DELETE: api/Categories/1
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted =
                    await _categoryService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(
                        $"Category with id {id} was not found.");
                }

                return Ok(new
                {
                    message = "Category deleted successfully."
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
    }
}