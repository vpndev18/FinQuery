using MediatR;
using FluentValidation;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseAPI.Features.Groups
{
    public class AddMemberToGroupCommand : IRequest<bool>
    {
        public Guid GroupId { get; set; }
        public string MemberEmail { get; set; }
        public Guid RequestingUserId { get; set; } // Only group creator can add members
    }

    public class AddMemberToGroupValidator : AbstractValidator<AddMemberToGroupCommand>
    {
        public AddMemberToGroupValidator()
        {
            RuleFor(x => x.MemberEmail).NotEmpty().EmailAddress();
        }
    }

    public class AddMemberToGroupHandler : IRequestHandler<AddMemberToGroupCommand, bool>
    {
        private readonly AppDbContext _context;

        public AddMemberToGroupHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AddMemberToGroupCommand request, CancellationToken cancellationToken)
        {
            // 1. Find the group
            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.GroupId == request.GroupId, cancellationToken);

            if (group == null)
                throw new KeyNotFoundException("Group not found");

            // 2. Verify requesting user is the creator or member (for now, anyone in group can add)
            if (!group.Members.Any(m => m.UserId == request.RequestingUserId))
                throw new UnauthorizedAccessException("Only group members can add new members");

            // 3. Find user by email
            var userToAdd = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.MemberEmail, cancellationToken);

            if (userToAdd == null)
                throw new KeyNotFoundException($"User with email {request.MemberEmail} not found");

            // 4. Check if already a member
            if (group.Members.Any(m => m.UserId == userToAdd.UserId))
                throw new InvalidOperationException("User is already a member of this group");

            // 5. Add member
            var newMember = new GroupMember
            {
                GroupId = request.GroupId,
                UserId = userToAdd.UserId,
                Balance = 0,
                JoinedDate = DateTime.UtcNow
            };

            _context.GroupMembers.Add(newMember);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
