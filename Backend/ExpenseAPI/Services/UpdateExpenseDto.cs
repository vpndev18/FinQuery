using System;
using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.Services.Dtos
{
    public class UpdateExpenseDto
    {
        public Guid? CategoryId { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal? Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime? Date { get; set; }
    }
}
