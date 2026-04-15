using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
    public class GroupMember
    {
        [Required]
        [ForeignKey("Group")]
        public Guid GroupId { get; set; }

        [Required]
        [ForeignKey("User")]
        public Guid UserId { get; set; }

        /// <summary>
        /// Positive means the user is owed money. Negative means the user owes money.
        /// </summary>
        public decimal Balance { get; set; } = 0;

        public DateTime JoinedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Group Group { get; set; }
        public User User { get; set; }
    }
}
