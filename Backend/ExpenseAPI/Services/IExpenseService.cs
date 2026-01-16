using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseAPI.Models;
using ExpenseAPI.Services.Dtos;

namespace ExpenseAPI.Services
{
    public interface IExpenseService
    {
        Task<List<Expense>> GetExpensesByUserAsync(Guid userId);
        Task<List<Expense>> GetExpensesByDateRangeAsync(Guid userId, DateTime start, DateTime end);
        Task<Expense?> GetExpenseByIdAsync(Guid expenseId, Guid userId);
        Task<Expense> CreateExpenseAsync(Guid userId, CreateExpenseDto dto);
        Task<bool> UpdateExpenseAsync(Guid expenseId, UpdateExpenseDto dto, Guid userId);
        Task<bool> DeleteExpenseAsync(Guid expenseId, Guid userId);
        Task<decimal> GetTotalSpendingAsync(Guid userId, DateTime? startDate, DateTime? endDate);
        Task<ExpenseSummaryDto> GetExpenseSummaryAsync(Guid userId, DateTime? startDate, DateTime? endDate);
    }
}
