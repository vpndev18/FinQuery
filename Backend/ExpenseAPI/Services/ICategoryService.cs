using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseAPI.Models;
using ExpenseAPI.Services.Dtos;

namespace ExpenseAPI.Services
{
    public interface ICategoryService
    {
        Task<List<Category>> GetCategoriesByUserAsync(Guid userId);
        Task<Category?> GetCategoryByIdAsync(Guid categoryId, Guid userId);
        Task<Category> CreateCategoryAsync(Guid userId, CreateCategoryDto dto);
        Task<bool> UpdateCategoryAsync(Guid categoryId, UpdateCategoryDto dto, Guid userId);
        Task<bool> DeleteCategoryAsync(Guid categoryId, Guid userId);
    }
}
