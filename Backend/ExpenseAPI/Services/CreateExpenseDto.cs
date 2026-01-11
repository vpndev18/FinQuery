using System;
using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.Services.Dtos
{
    public class CreateExpenseDto
    {
        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public DateTime Date { get; set; }
    }
}
