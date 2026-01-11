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
    public class ExpenseService : IExpenseService
    {
        private readonly AppDbContext _context;

        public ExpenseService(AppDbContext context)
        {
            _context = context;
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
    }
}
