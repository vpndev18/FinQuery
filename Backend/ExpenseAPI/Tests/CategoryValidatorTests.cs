using ExpenseAPI.Services.Dtos;
using ExpenseAPI.Validators;
using FluentValidation.TestHelper;

namespace ExpenseAPI.Tests;

public class CreateCategoryDtoValidatorTests
{
    private readonly CreateCategoryDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes_Validation()
    {
        var dto = new CreateCategoryDto { Name = "Food", Color = "#FF5733" };

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Empty_Name_Fails_Validation(string? name)
    {
        var dto = new CreateCategoryDto { Name = name!, Color = "#FFFFFF" };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Name_Over_100_Chars_Fails_Validation()
    {
        var dto = new CreateCategoryDto { Name = new string('x', 101), Color = "#FFFFFF" };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Theory]
    [InlineData("red")]          // not a hex
    [InlineData("#ZZZZZZ")]      // invalid hex characters
    [InlineData("#FF")]          // too short
    [InlineData("FF5733")]       // missing #
    public void Invalid_Hex_Color_Fails_Validation(string color)
    {
        var dto = new CreateCategoryDto { Name = "Food", Color = color };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Color);
    }

    [Theory]
    [InlineData("#FFF")]         // 3-digit hex
    [InlineData("#FFFFFF")]      // 6-digit hex
    [InlineData("#a1b2c3")]      // lowercase
    public void Valid_Hex_Color_Passes_Validation(string color)
    {
        var dto = new CreateCategoryDto { Name = "Food", Color = color };

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveValidationErrorFor(x => x.Color);
    }
}
