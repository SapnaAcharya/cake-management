using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Category;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();
        }

        public async Task<CategoryResponseDto?> GetByIdAsync(int id)
        {
            return await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CategoryResponseDto> CreateAsync(
            CreateCategoryDto dto)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower());

            if (categoryExists)
            {
                throw new InvalidOperationException(
                    "A category with this name already exists.");
            }

            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Categories.Add(category);

            await _context.SaveChangesAsync();

            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            };
        }

        public async Task<bool> UpdateAsync(
            int id,
            UpdateCategoryDto dto)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return false;
            }

            var duplicate = await _context.Categories
                .AnyAsync(c =>
                    c.Id != id &&
                    c.Name.ToLower() == dto.Name.ToLower());

            if (duplicate)
            {
                throw new InvalidOperationException(
                    "A category with this name already exists.");
            }

            category.Name = dto.Name;
            category.Description = dto.Description;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Cakes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return false;
            }

            if (category.Cakes.Any())
            {
                throw new InvalidOperationException(
                    "Cannot delete a category that contains cakes.");
            }

            _context.Categories.Remove(category);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}