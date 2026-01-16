using FluentValidation;
using ExpenseAPI.Services.Dtos;

namespace ExpenseAPI.Validators
{
    public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

            RuleFor(x => x.Color)
                .NotEmpty().WithMessage("Color is required.")
                .Matches("^#(?:[0-9a-fA-F]{3}){1,2}$").WithMessage("Color must be a valid hex code (e.g., #FF5733).");
        }
    }

    public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
    {
        public UpdateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Name))
                .WithMessage("Name cannot exceed 100 characters.");

            RuleFor(x => x.Color)
                .Matches("^#(?:[0-9a-fA-F]{3}){1,2}$").When(x => !string.IsNullOrEmpty(x.Color))
                .WithMessage("Color must be a valid hex code (e.g., #FF5733).");
        }
    }
}
