using Microsoft.AspNetCore.SignalR;

namespace ExpenseAPI.Hubs
{
    public class ExpenseHub : Hub
    {
        // Clients join a group to receive updates for that specific expense group
        public async Task JoinGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }

        public async Task LeaveGroup(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }

        // Called by backend to notify clients
        public async Task NotifyGroupUpdated(string groupId)
        {
            await Clients.Group(groupId).SendAsync("GroupUpdated");
        }
    }
}
