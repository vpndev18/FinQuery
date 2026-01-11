using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.Services.Dtos
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        // You might want to add a Regex for Hex color validation if strict
        public string Color { get; set; } 
    }
}
