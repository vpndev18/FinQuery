using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
    /// <summary>
    /// Represents an expense transaction.
    /// </summary>
    public class Expense
    {
        /// <summary>
        /// Primary key.
        /// </summary>
        [Key]
        public Guid ExpenseId { get; set; }

        /// <summary>
        /// Foreign key to User.
        /// </summary>
        [Required]
        [ForeignKey("User")]
        public Guid UserId { get; set; }

        /// <summary>
        /// Foreign key to Category.
        /// </summary>
        [Required]
        [ForeignKey("Category")]
        public Guid CategoryId { get; set; }

        /// <summary>
        /// Expense amount (required, must be > 0).
        /// </summary>
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        /// <summary>
        /// Optional description (max 500 chars).
        /// </summary>
        [MaxLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// Transaction date.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Date the expense was created.
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Indicates if the expense is deleted (soft delete, defaults to false).
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// Navigation property to the user.
        /// </summary>
        public User User { get; set; }

        /// <summary>
        /// Navigation property to the category.
        /// </summary>
        public Category Category { get; set; }
    }

}
