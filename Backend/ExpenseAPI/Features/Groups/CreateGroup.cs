using MediatR;
using FluentValidation;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ExpenseAPI.Features.Groups
{
    // Command
    public class CreateGroupCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public Guid UserId { get; set; } // The creator
    }

    // Validator
    public class CreateGroupValidator : AbstractValidator<CreateGroupCommand>
    {
        public CreateGroupValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        }
    }

    // Handler
    public class CreateGroupHandler : IRequestHandler<CreateGroupCommand, Guid>
    {
        private readonly AppDbContext _context;

        public CreateGroupHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
        {
            var group = new Group
            {
                GroupId = Guid.NewGuid(),
                Name = request.Name,
                CreatedByUserId = request.UserId,
                CreatedDate = DateTime.UtcNow
            };

            // Automatically add the creator as a member
            var member = new GroupMember
            {
                GroupId = group.GroupId,
                UserId = request.UserId,
                JoinedDate = DateTime.UtcNow
            };

            _context.Groups.Add(group);
            _context.GroupMembers.Add(member);

            await _context.SaveChangesAsync(cancellationToken);

            return group.GroupId;
        }
    }
}
