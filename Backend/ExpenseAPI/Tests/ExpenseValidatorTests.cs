using ExpenseAPI.Services.Dtos;
using ExpenseAPI.Validators;
using FluentValidation.TestHelper;

namespace ExpenseAPI.Tests;

public class CreateExpenseDtoValidatorTests
{
    private readonly CreateExpenseDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes_Validation()
    {
        var dto = new CreateExpenseDto
        {
            CategoryId = Guid.NewGuid(),
            Amount = 50.00m,
            Date = DateTime.UtcNow.AddDays(-1),
            Description = "Groceries"
        };

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_CategoryId_Fails_Validation()
    {
        var dto = new CreateExpenseDto
        {
            CategoryId = Guid.Empty,
            Amount = 50.00m,
            Date = DateTime.UtcNow
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100.50)]
    public void NonPositive_Amount_Fails_Validation(decimal amount)
    {
        var dto = new CreateExpenseDto
        {
            CategoryId = Guid.NewGuid(),
            Amount = amount,
            Date = DateTime.UtcNow
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Future_Date_Fails_Validation()
    {
        var dto = new CreateExpenseDto
        {
            CategoryId = Guid.NewGuid(),
            Amount = 10m,
            Date = DateTime.UtcNow.AddDays(5)
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Date);
    }

    [Fact]
    public void Description_Over_500_Chars_Fails_Validation()
    {
        var dto = new CreateExpenseDto
        {
            CategoryId = Guid.NewGuid(),
            Amount = 10m,
            Date = DateTime.UtcNow,
            Description = new string('x', 501)
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Description);
    }
}
