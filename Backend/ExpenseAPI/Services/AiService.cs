using Mscc.GenerativeAI;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseAPI.Services
{
    public interface IAiService
    {
        Task<string> GetAnalystResponseAsync(string query, string userId);
        Task<string> GetBudgetForecastAsync(string userId);
    }

    public class AiService : IAiService
    {
        private readonly GenerativeModel _model;
        private readonly IVectorDbService _vectorDb;
        private readonly AppDbContext _dbContext;

        public AiService(GenerativeModel chatModel, IVectorDbService vectorDb, AppDbContext dbContext)
        {
            _model = chatModel;
            _vectorDb = vectorDb;
            _dbContext = dbContext;
        }

        public async Task<string> GetAnalystResponseAsync(string query, string userId)
        {
            // 1. Retrieve relevant expenses from Vector DB
            var expenseIds = await _vectorDb.SearchRelevantExpensesAsync(query, userId);
            var expenses = await _dbContext.Expenses
                .Include(e => e.Category)
                .Where(e => expenseIds.Contains(e.ExpenseId))
                .ToListAsync();

            // 2. Build context for the LLM
            var context = string.Join("\n", expenses.Select(e => 
                $"- {e.Date.ToShortDateString()}: {e.Description} ({e.Category?.Name}) - ${e.Amount}"));

            var prompt = $@"
                You are a Personal Financial Analyst. Based on the following spending history of the user, answer their question.
                If you don't know the answer, say you don't have enough data. Keep the tone professional and helpful.

                History:
                {context}

                User Question: {query}
                Answer:";

            var response = await _model.GenerateContent(prompt);
            return response.Text;
        }

        public async Task<string> GetBudgetForecastAsync(string userId)
        {
            // 1. Get recent spending trends from SQL
            var last30Days = DateTime.UtcNow.AddDays(-30);
            var userGuid = Guid.Parse(userId);
            var recentExpenses = await _dbContext.Expenses
                .Where(e => e.UserId == userGuid && e.Date >= last30Days)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            var summary = string.Join("\n", recentExpenses.Select(e => 
                $"- {e.Description}: ${e.Amount}"));

            var prompt = $@"
                Analyze the following recent spending for the user and provide:
                1. A brief summary of their top spending categories.
                2. A prediction of their total spending for the NEXT 30 days.
                3. One actionable tip to save money based on this data.

                Spending (Last 30 Days):
                {summary}

                Response:";

            var response = await _model.GenerateContent(prompt);
            return response.Text;
        }
    }
}
