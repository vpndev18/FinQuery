using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ExpenseAPI.Models;
using ExpenseAPI.Services;
using ExpenseAPI.Services.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ExpenseAPI.Controllers
{
    [ApiController]
    [Route("api/categories")] // Plural resource
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        // GET: /api/categories
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Category>>> GetCategories()
        {
            try
            {
                var userId = GetUserId();
                if (userId == Guid.Empty)
                    return Unauthorized("User not authenticated.");

                var categories = await _categoryService.GetCategoriesByUserAsync(userId);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories.");
                return StatusCode(500, "An error occurred while retrieving categories.");
            }
        }

        // GET: /api/categories/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Category>> GetCategory(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var category = await _categoryService.GetCategoryByIdAsync(id, userId);

                if (category == null)
                    return NotFound("Category not found or does not belong to user.");

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category.");
                return StatusCode(500, "An error occurred while retrieving the category.");
            }
        }

        // POST: /api/categories
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            try
            {
                var userId = GetUserId();
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var category = await _categoryService.CreateCategoryAsync(userId, dto);
                return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error creating category.");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category.");
                return StatusCode(500, "An error occurred while creating the category.");
            }
        }

        // PUT: /api/categories/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto dto)
        {
            try
            {
                var userId = GetUserId();
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updated = await _categoryService.UpdateCategoryAsync(id, dto, userId);
                if (!updated)
                    return NotFound("Category not found or does not belong to user.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error updating category.");
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                 return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category.");
                return StatusCode(500, "An error occurred while updating the category.");
            }
        }

        // DELETE: /api/categories/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var deleted = await _categoryService.DeleteCategoryAsync(id, userId);
                if (!deleted)
                    return NotFound("Category not found or does not belong to user.");

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                 return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category.");
                return StatusCode(500, "An error occurred while deleting the category.");
            }
        }

        private Guid GetUserId()
        {
            var sub = User.FindFirst("sub")?.Value;
            // Fallback for some JWT setups where sub might be mapped to NameIdentifier
            if (string.IsNullOrEmpty(sub))
                sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
            return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
        }
    }
}
