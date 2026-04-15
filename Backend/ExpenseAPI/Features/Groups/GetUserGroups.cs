using MediatR;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseAPI.Features.Groups
{
    public class GroupDto
    {
        public Guid GroupId { get; set; }
        public string Name { get; set; }
        public decimal MyBalance { get; set; }
        public int MemberCount { get; set; }
    }

    public class GetUserGroupsQuery : IRequest<List<GroupDto>>
    {
        public Guid UserId { get; set; }
    }

    public class GetUserGroupsHandler : IRequestHandler<GetUserGroupsQuery, List<GroupDto>>
    {
        private readonly AppDbContext _context;

        public GetUserGroupsHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GroupDto>> Handle(GetUserGroupsQuery request, CancellationToken cancellationToken)
        {
            // Select groups where the user is a member
            var groups = await _context.GroupMembers
                .Where(gm => gm.UserId == request.UserId)
                .Include(gm => gm.Group)
                .ThenInclude(g => g.Members)
                .Select(gm => new GroupDto
                {
                    GroupId = gm.GroupId,
                    Name = gm.Group.Name,
                    MyBalance = gm.Balance,
                    MemberCount = gm.Group.Members.Count
                })
                .ToListAsync(cancellationToken);

            return groups;
        }
    }
}
