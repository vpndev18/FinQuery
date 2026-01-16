using System;
using System.Collections.Generic;

namespace ExpenseAPI.Services.Dtos
{
    public class ExpenseSummaryDto
    {
        public decimal TotalSpending { get; set; }
        public decimal AverageTransaction { get; set; }
        public List<ExpenseCategorySummary> ByCategory { get; set; } = new();
    }

    public class ExpenseCategorySummary
    {
        public Guid CategoryId { get; set; }
        public decimal Total { get; set; }
        public int Count { get; set; }
    }
}
