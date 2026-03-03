using FluentValidation;
using WeeklyPlanner.Application.DTOs;

namespace WeeklyPlanner.Application.Validators;

public class CreateWeeklyPlanValidator : AbstractValidator<CreateWeeklyPlanDto>
{
    public CreateWeeklyPlanValidator()
    {
        RuleFor(x => x.StartDate).NotEmpty().LessThan(x => x.EndDate);
        RuleFor(x => x.EndDate).NotEmpty();
        RuleFor(x => x.ClientPercentage).InclusiveBetween(0, 100);
        RuleFor(x => x.TechDebtPercentage).InclusiveBetween(0, 100);
        RuleFor(x => x.RndPercentage).InclusiveBetween(0, 100);
        
        RuleFor(x => x)
            .Must(x => x.ClientPercentage + x.TechDebtPercentage + x.RndPercentage == 100)
            .WithMessage("Total percentage must equal 100%.");
    }
}

public class CreateBacklogItemValidator : AbstractValidator<CreateBacklogItemDto>
{
    public CreateBacklogItemValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.EstimatedHours).GreaterThan(0);
    }
}
