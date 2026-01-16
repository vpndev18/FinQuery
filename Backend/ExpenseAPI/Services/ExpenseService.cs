using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using ExpenseAPI.Services.Dtos;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace ExpenseAPI.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly AppDbContext _context;
        private readonly IDistributedCache _cache;

        public ExpenseService(AppDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<List<Expense>> GetExpensesByUserAsync(Guid userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && !e.IsDeleted)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<List<Expense>> GetExpensesByDateRangeAsync(Guid userId, DateTime start, DateTime end)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && !e.IsDeleted && e.Date >= start && e.Date <= end)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<Expense?> GetExpenseByIdAsync(Guid expenseId, Guid userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.UserId == userId && !e.IsDeleted);
        }

        public async Task<Expense> CreateExpenseAsync(Guid userId, CreateExpenseDto dto)
        {
            if (dto.Amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == dto.CategoryId && c.UserId == userId && !c.IsDeleted);

            if (category == null)
                throw new ArgumentException("Category does not exist or does not belong to the user.");

            var expense = new Expense
            {
                ExpenseId = Guid.NewGuid(),
                UserId = userId,
                CategoryId = dto.CategoryId,
                Amount = dto.Amount,
                Description = dto.Description,
                Date = dto.Date,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task<bool> UpdateExpenseAsync(Guid expenseId, UpdateExpenseDto dto, Guid userId)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.UserId == userId && !e.IsDeleted);

            if (expense == null)
                throw new KeyNotFoundException("Expense not found or does not belong to the user.");

            if (dto.Amount.HasValue && dto.Amount.Value <= 0)
                throw new ArgumentException("Amount must be greater than zero.");

            if (dto.CategoryId.HasValue)
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryId == dto.CategoryId.Value && c.UserId == userId && !c.IsDeleted);

                if (category == null)
                    throw new ArgumentException("Category does not exist or does not belong to the user.");

                expense.CategoryId = dto.CategoryId.Value;
            }

            if (dto.Amount.HasValue)
                expense.Amount = dto.Amount.Value;

            if (dto.Description != null)
                expense.Description = dto.Description;

            if (dto.Date.HasValue)
                expense.Date = dto.Date.Value;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteExpenseAsync(Guid expenseId, Guid userId)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.ExpenseId == expenseId && e.UserId == userId && !e.IsDeleted);

            if (expense == null)
                throw new KeyNotFoundException("Expense not found or does not belong to the user.");

            expense.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> GetTotalSpendingAsync(Guid userId, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Expenses
                .Where(e => e.UserId == userId && !e.IsDeleted);

            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate.Value);

            return await query.SumAsync(e => e.Amount);
        }

        public async Task<ExpenseSummaryDto> GetExpenseSummaryAsync(Guid userId, DateTime? startDate, DateTime? endDate)
        {
            // Create a unique cache key
            string cacheKey = $"summary:{userId}:{startDate:yyyyMMdd}:{endDate:yyyyMMdd}";

            // Try to get from cache
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<ExpenseSummaryDto>(cachedData)!;
            }

            // Calculate summary
            var expenses = await GetExpensesByUserAsync(userId);
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

            // Save to cache with expiration
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(summary), cacheOptions);

            return summary;
        }
    }
}
