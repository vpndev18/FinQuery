using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
    

    /// <summary>
    /// Represents an application user.
    /// </summary>
    public class User
    {
        /// <summary>
        /// Primary key.
        /// </summary>
        [Key]
        public Guid UserId { get; set; }

        /// <summary>
        /// User's email address (unique, required, max 255 chars).
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Email { get; set; }

        /// <summary>
        /// Bcrypt password hash (required).
        /// </summary>
        [Required]
        public string PasswordHash { get; set; }

        /// <summary>
        /// Date the user was created (defaults to UtcNow).
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Last login date (nullable).
        /// </summary>
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// Indicates if the user is active (defaults to true).
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Navigation property for user's categories.
        /// </summary>
        public ICollection<Category> Categories { get; set; }

        /// <summary>
        /// Navigation property for user's expenses.
        /// </summary>
        public ICollection<Expense> Expenses { get; set; }
    }

}
