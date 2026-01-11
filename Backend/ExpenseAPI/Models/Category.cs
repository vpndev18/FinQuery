using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
   

    /// <summary>
    /// Represents an expense category.
    /// </summary>
    public class Category
    {
        /// <summary>
        /// Primary key.
        /// </summary>
        [Key]
        public Guid CategoryId { get; set; }

        /// <summary>
        /// Foreign key to User.
        /// </summary>
        [Required]
        [ForeignKey("User")]
        public Guid UserId { get; set; }

        /// <summary>
        /// Category name (required, max 100 chars).
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// Hex color code (e.g., "#FF5733").
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Date the category was created.
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Indicates if the category is deleted (soft delete, defaults to false).
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// Navigation property to the user.
        /// </summary>
        public User User { get; set; }

        /// <summary>
        /// Navigation property for category's expenses.
        /// </summary>
        public ICollection<Expense> Expenses { get; set; }
    }

}
