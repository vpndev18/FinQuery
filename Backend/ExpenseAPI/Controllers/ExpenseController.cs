using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
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
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;
        private readonly ILogger<ExpensesController> _logger;

        public ExpensesController(IExpenseService expenseService, ILogger<ExpensesController> logger)
        {
            _expenseService = expenseService;
            _logger = logger;
        }

        // GET: /api/expenses?startDate=2025-01-01&endDate=2025-01-31&categoryId=guid
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Expense>>> GetExpenses(
            [FromQuery] DateTime? startDate, 
            [FromQuery] DateTime? endDate,
            [FromQuery] Guid? categoryId)
        {
            try
            {
                var userId = GetUserId();
                if (userId == Guid.Empty)
                    return Unauthorized("User not authenticated.");

                List<Expense> expenses;
                if (startDate.HasValue || endDate.HasValue)
                {
                    var start = startDate ?? DateTime.MinValue;
                    var end = endDate ?? DateTime.MaxValue;
                    expenses = await _expenseService.GetExpensesByDateRangeAsync(userId, start, end);
                }
                else
                {
                    expenses = await _expenseService.GetExpensesByUserAsync(userId);
                }
                
                // Filter by category if provided
                if (categoryId.HasValue)
                {
                    expenses = expenses.Where(e => e.CategoryId == categoryId.Value).ToList();
                }
                
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses.");
                return StatusCode(500, "An error occurred while retrieving expenses.");
            }
        }

        // GET: /api/expenses/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Expense>> GetExpense(Guid id)
        {
            try
            {
                var userId = GetUserId();
                //if (userId == Guid.Empty)
                //    return Unauthorized("User not authenticated.");

                var expense = await _expenseService.GetExpenseByIdAsync(id, userId);
                if (expense == null)
                    return NotFound("Expense not found or does not belong to user.");

                return Ok(expense);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expense.");
                return StatusCode(500, "An error occurred while retrieving the expense.");
            }
        }

        // GET: /api/expenses/summary
        [HttpGet("summary")]
        [Authorize]
        public async Task<ActionResult<ExpenseSummaryDto>> GetSummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var userId = GetUserId();
                //if (userId == Guid.Empty)
                //    return Unauthorized("User not authenticated.");

                var expenses = await _expenseService.GetExpensesByUserAsync(userId);
                if (startDate.HasValue)
                    expenses = expenses.Where(e => e.Date >= startDate.Value).ToList();
                if (endDate.HasValue)
                    expenses = expenses.Where(e => e.Date <= endDate.Value).ToList();

                var totalSpending = expenses.Sum(e => e.Amount);
                var averageTransaction = expenses.Count > 0 ? expenses.Average(e => e.Amount) : 0m;
                var byCategory = expenses
                    .GroupBy(e => e.CategoryId)
                    .Select(g => new ExpenseCategorySummary
                    {
                        CategoryId = g.Key,
                        Total = g.Sum(e => e.Amount),
                        Count = g.Count()
                    })
                    .ToList();

                var summary = new ExpenseSummaryDto
                {
                    TotalSpending = totalSpending,
                    AverageTransaction = averageTransaction,
                    ByCategory = byCategory
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expense summary.");
                return StatusCode(500, "An error occurred while retrieving the summary.");
            }
        }

        // POST: /api/expenses
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Expense>> CreateExpense([FromBody] CreateExpenseDto dto)
        {
            try
            {
                var userId = GetUserId();
                //if (userId == Guid.Empty)
                //    return Unauthorized("User not authenticated.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (dto.Amount <= 0)
                    return BadRequest("Amount must be greater than zero.");

                if (dto.Date > DateTime.UtcNow)
                    return BadRequest("Date cannot be in the future.");

                var expense = await _expenseService.CreateExpenseAsync(userId, dto);
                return CreatedAtAction(nameof(GetExpense), new { id = expense.ExpenseId }, expense);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error creating expense.");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating expense.");
                return StatusCode(500, "An error occurred while creating the expense.");
            }
        }

        // PUT: /api/expenses/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateExpense(Guid id, [FromBody] UpdateExpenseDto dto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == Guid.Empty)
                    return Unauthorized("User not authenticated.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updated = await _expenseService.UpdateExpenseAsync(id, dto, userId);
                if (!updated)
                    return Unauthorized("Expense not found or does not belong to user.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error updating expense.");
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Expense not found for update.");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating expense.");
                return StatusCode(500, "An error occurred while updating the expense.");
            }
        }

        // DELETE: /api/expenses/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteExpense(Guid id)
        {
            try
            {
                var userId = GetUserId();
                if (userId == Guid.Empty)
                    return Unauthorized("User not authenticated.");

                var deleted = await _expenseService.DeleteExpenseAsync(id, userId);
                if (!deleted)
                    return NotFound("Expense not found or does not belong to user.");

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Expense not found for deletion.");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting expense.");
                return StatusCode(500, "An error occurred while deleting the expense.");
            }
        }

        private Guid GetUserId()
        {
            var sub = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(sub))
                sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
        }
    }

    // DTOs for summary endpoint
    public class ExpenseSummaryDto
    {
        public decimal TotalSpending { get; set; }
        public decimal AverageTransaction { get; set; }
        public List<ExpenseCategorySummary> ByCategory { get; set; }
    }

    public class ExpenseCategorySummary
    {
        public Guid CategoryId { get; set; }
        public decimal Total { get; set; }
        public int Count { get; set; }
    }
}
