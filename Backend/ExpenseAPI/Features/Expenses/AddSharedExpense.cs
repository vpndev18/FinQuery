using MediatR;
using FluentValidation;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using ExpenseAPI.Hubs;

namespace ExpenseAPI.Features.Expenses
{
    // Command
    public class AddSharedExpenseCommand : IRequest<Guid>
    {
        public Guid UserId { get; set; } // Creator / Payer
        public Guid GroupId { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public Guid CategoryId { get; set; }
        
        // Simple equal split logic for now. 
        // In a full implementation, we would accept a list of splits.
        // public List<Guid> SplitWithUserIds { get; set; } 
    }

    public class AddSharedExpenseHandler : IRequestHandler<AddSharedExpenseCommand, Guid>
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ExpenseHub> _hubContext;

        public AddSharedExpenseHandler(AppDbContext context, IHubContext<ExpenseHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<Guid> Handle(AddSharedExpenseCommand request, CancellationToken cancellationToken)
        {
            // 1. Validate Group Membership
            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.GroupId == request.GroupId, cancellationToken);

            if (group == null) throw new KeyNotFoundException("Group not found");

            // Ensure payer is member
            if (!group.Members.Any(m => m.UserId == request.UserId))
                throw new UnauthorizedAccessException("You are not a member of this group");

            // 2. Create Expense
            var expense = new Expense
            {
                ExpenseId = Guid.NewGuid(),
                UserId = request.UserId, // Creator
                PaidByUserId = request.UserId, // Assuming creator paid for now
                GroupId = request.GroupId,
                Amount = request.Amount,
                Description = request.Description,
                Date = request.Date,
                CategoryId = request.CategoryId,
                CreatedDate = DateTime.UtcNow
            };

            // 3. Calculate Splits (Equal Split among ALL members)
            var memberCount = group.Members.Count;
            var splitAmount = request.Amount / memberCount;

            foreach (var member in group.Members)
            {
                var split = new ExpenseSplit
                {
                    ExpenseId = expense.ExpenseId,
                    UserId = member.UserId,
                    Amount = splitAmount
                };
                _context.ExpenseSplits.Add(split);

                // Update Balance
                // If I paid 100, and there are 2 people (Me, You). Split is 50.
                // My balance in group: +50 (I am owed 50)
                // Your balance in group: -50 (You owe 50)
                
                if (member.UserId == request.UserId)
                {
                    // Payer gets credit for the portion others owe
                    // Total Paid (100) - Own Share (50) = +50
                    member.Balance += (request.Amount - splitAmount);
                }
                else
                {
                    // Others owe their share
                    member.Balance -= splitAmount;
                }
            }

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync(cancellationToken);

            // 4. Notify Group via SignalR
            await _hubContext.Clients.Group(request.GroupId.ToString())
                .SendAsync("GroupUpdated", cancellationToken);

            return expense.ExpenseId;
        }
    }
}
