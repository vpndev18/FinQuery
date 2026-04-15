using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
    public class Group
    {
        [Key]
        public Guid GroupId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [ForeignKey("CreatedByUser")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User CreatedByUser { get; set; }
        public ICollection<GroupMember> Members { get; set; }
        public ICollection<Expense> Expenses { get; set; }
    }
}
