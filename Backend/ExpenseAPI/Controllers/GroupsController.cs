using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExpenseAPI.Features.Groups;
using ExpenseAPI.Features.Expenses;
using System.Security.Claims;

namespace ExpenseAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GroupsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _mediator.Send(new GetUserGroupsQuery { UserId = userId });
            return Ok(result);
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupDetails(Guid groupId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _mediator.Send(new GetGroupDetailsQuery { GroupId = groupId, UserId = userId });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupCommand command)
        {
            command.UserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var groupId = await _mediator.Send(command);
            return Ok(new { GroupId = groupId });
        }

        [HttpPost("{groupId}/members")]
        public async Task<IActionResult> AddMember(Guid groupId, [FromBody] AddMemberRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var command = new AddMemberToGroupCommand 
            { 
                GroupId = groupId, 
                MemberEmail = request.Email,
                RequestingUserId = userId 
            };
            await _mediator.Send(command);
            return Ok(new { Message = "Member added successfully" });
        }

        [HttpPost("expenses")]
        public async Task<IActionResult> AddGroupExpense([FromBody] AddSharedExpenseCommand command)
        {
            command.UserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var expenseId = await _mediator.Send(command);
            return Ok(new { ExpenseId = expenseId });
        }
    }

    public class AddMemberRequest
    {
        public string Email { get; set; }
    }
}
