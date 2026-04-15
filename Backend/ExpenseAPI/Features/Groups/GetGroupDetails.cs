using MediatR;
using ExpenseAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseAPI.Features.Groups
{
    public class GroupMemberDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public decimal Balance { get; set; }
        public DateTime JoinedDate { get; set; }
    }

    public class GroupExpenseDto
    {
        public Guid ExpenseId { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string PaidByUserEmail { get; set; }
        public string CategoryName { get; set; }
    }

    public class GroupDetailsDto
    {
        public Guid GroupId { get; set; }
        public string Name { get; set; }
        public string CreatedByEmail { get; set; }
        public List<GroupMemberDto> Members { get; set; }
        public List<GroupExpenseDto> Expenses { get; set; }
    }

    public class GetGroupDetailsQuery : IRequest<GroupDetailsDto>
    {
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; } // For authorization
    }

    public class GetGroupDetailsHandler : IRequestHandler<GetGroupDetailsQuery, GroupDetailsDto>
    {
        private readonly AppDbContext _context;

        public GetGroupDetailsHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<GroupDetailsDto> Handle(GetGroupDetailsQuery request, CancellationToken cancellationToken)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                    .ThenInclude(m => m.User)
                .Include(g => g.CreatedByUser)
                .Include(g => g.Expenses.Where(e => !e.IsDeleted))
                    .ThenInclude(e => e.PaidByUser)
                .Include(g => g.Expenses.Where(e => !e.IsDeleted))
                    .ThenInclude(e => e.Category)
                .FirstOrDefaultAsync(g => g.GroupId == request.GroupId, cancellationToken);

            if (group == null)
                throw new KeyNotFoundException("Group not found");

            // Check if user is a member
            if (!group.Members.Any(m => m.UserId == request.UserId))
                throw new UnauthorizedAccessException("You are not a member of this group");

            return new GroupDetailsDto
            {
                GroupId = group.GroupId,
                Name = group.Name,
                CreatedByEmail = group.CreatedByUser.Email,
                Members = group.Members.Select(m => new GroupMemberDto
                {
                    UserId = m.UserId,
                    Name = m.User.Name,
                    Email = m.User.Email,
                    Balance = m.Balance,
                    JoinedDate = m.JoinedDate
                }).OrderByDescending(m => m.JoinedDate).ToList(),
                Expenses = group.Expenses.Select(e => new GroupExpenseDto
                {
                    ExpenseId = e.ExpenseId,
                    Description = e.Description,
                    Amount = e.Amount,
                    Date = e.Date,
                    PaidByUserEmail = e.PaidByUser?.Email ?? "Unknown",
                    CategoryName = e.Category?.Name ?? "Uncategorized"
                }).OrderByDescending(e => e.Date).ToList()
            };
        }
    }
}
