using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.Services.Dtos
{
    public class UpdateCategoryDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        public string? Color { get; set; }
    }
}
