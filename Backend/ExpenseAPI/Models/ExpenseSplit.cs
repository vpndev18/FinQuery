using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
    public class ExpenseSplit
    {
        [Key]
        public Guid SplitId { get; set; }

        [Required]
        [ForeignKey("Expense")]
        public Guid ExpenseId { get; set; }

        [Required]
        [ForeignKey("User")]
        public Guid UserId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        // Navigation properties
        public Expense Expense { get; set; }
        public User User { get; set; }
    }
}
