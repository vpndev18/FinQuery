using Mscc.GenerativeAI;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using ExpenseAPI.Models;

namespace ExpenseAPI.Services
{
    public interface IVectorDbService
    {
        Task UpsertExpenseEmbeddingAsync(Expense expense);
        Task<List<Guid>> SearchRelevantExpensesAsync(string query, string userId, int limit = 5);
    }

    public class VectorDbService : IVectorDbService
    {
        private readonly QdrantClient _client;
        private readonly GenerativeModel _model;
        private const string CollectionName = "expenses";

        public VectorDbService(IConfiguration configuration, GenerativeModel embeddingModel)
        {
            var host = configuration["Qdrant:Host"] ?? "localhost";
            _client = new QdrantClient(host);
            _model = embeddingModel;
        }

        public async Task UpsertExpenseEmbeddingAsync(Expense expense)
        {
            // Ensure collection exists
            var collections = await _client.ListCollectionsAsync();
            if (!collections.Contains(CollectionName))
            {
                await _client.CreateCollectionAsync(CollectionName, 
                    new VectorParams { Size = 1536, Distance = Distance.Cosine });
            }

            var textToEmbed = $"Description: {expense.Description}, Category: {expense.Category?.Name}, Amount: {expense.Amount}, Date: {expense.Date}";
            var response = await _model.EmbedContent(textToEmbed);
            var embedding = response.Embedding.Values;

            await _client.UpsertAsync(CollectionName, new[]
            {
                new PointStruct
                {
                    Id = expense.ExpenseId,
                    Vectors = embedding.ToArray(),
                    Payload = 
                    {
                        ["userId"] = expense.UserId.ToString(),
                        ["description"] = expense.Description,
                        ["amount"] = (double)expense.Amount,
                        ["date"] = expense.Date.ToString("o")
                    }
                }
            });
        }

        public async Task<List<Guid>> SearchRelevantExpensesAsync(string query, string userId, int limit = 5)
        {
            var response = await _model.EmbedContent(query);
            var embedding = response.Embedding.Values;

            var searchResult = await _client.SearchAsync(
                CollectionName,
                embedding.ToArray(),
                filter: new Qdrant.Client.Grpc.Filter
                {
                    Must = { new Qdrant.Client.Grpc.Condition { Field = new Qdrant.Client.Grpc.FieldCondition { Key = "userId", Match = new Qdrant.Client.Grpc.Match { Keyword = userId } } } }
                },
                limit: (ulong)limit
            );

            return searchResult.Select(r => Guid.Parse(r.Id.Uuid)).ToList();
        }
    }
}
