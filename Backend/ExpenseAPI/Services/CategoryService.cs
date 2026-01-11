using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using ExpenseAPI.Services.Dtos;

namespace ExpenseAPI.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetCategoriesByUserAsync(Guid userId)
        {
            return await _context.Categories
                .Where(c => c.UserId == userId && !c.IsDeleted)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(Guid categoryId, Guid userId)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId && c.UserId == userId && !c.IsDeleted);
        }

        public async Task<Category> CreateCategoryAsync(Guid userId, CreateCategoryDto dto)
        {
            // Optional: Check if category with same name exists for user
            var existing = await _context.Categories
                .AnyAsync(c => c.UserId == userId && c.Name.ToLower() == dto.Name.ToLower() && !c.IsDeleted);
            
            if (existing)
                throw new ArgumentException("Category with this name already exists.");

            var category = new Category
            {
                CategoryId = Guid.NewGuid(),
                UserId = userId,
                Name = dto.Name,
                Color = dto.Color,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> UpdateCategoryAsync(Guid categoryId, UpdateCategoryDto dto, Guid userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId && c.UserId == userId && !c.IsDeleted);

            if (category == null)
                throw new KeyNotFoundException("Category not found or does not belong to the user.");

            if (dto.Name != null)
            {
                // Check uniqueness if name is changing
                if (dto.Name.ToLower() != category.Name.ToLower())
                {
                    var existing = await _context.Categories
                        .AnyAsync(c => c.UserId == userId && c.Name.ToLower() == dto.Name.ToLower() && !c.IsDeleted);
                    if (existing)
                        throw new ArgumentException("Category with this name already exists.");
                }
                category.Name = dto.Name;
            }

            if (dto.Color != null)
                category.Color = dto.Color;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCategoryAsync(Guid categoryId, Guid userId)
        {
            var category = await _context.Categories
                .Include(c => c.Expenses) // Optional: Check if used?
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId && c.UserId == userId && !c.IsDeleted);

            if (category == null)
                throw new KeyNotFoundException("Category not found or does not belong to the user.");

            // Soft delete
            category.IsDeleted = true;
            
            // Optional: cascade delete expenses? Or keep them?
            // The logic in ExpenseService checks for !c.IsDeleted when validating category,
            // so existing expenses might become orphan-like or valid but category hidden.
            // Usually we might want to keep expenses but maybe nullify category or just keep link.
            // For now, simple soft delete of category.

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
