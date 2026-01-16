using Serilog.Context;

namespace ExpenseAPI.Middleware
{
    public class CorrelationIdMiddleware
    {
        private readonly RequestDelegate _next;
        private const string CorrelationIdHeader = "X-Correlation-Id";

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            var correlationId = GetCorrelationId(context);

            // Add the correlation ID to the response headers
            context.Response.OnStarting(() =>
            {
                if (!context.Response.Headers.ContainsKey(CorrelationIdHeader))
                {
                    context.Response.Headers[CorrelationIdHeader] = correlationId;
                }
                return Task.CompletedTask;
            });

            // Push the correlation ID to the log context
            using (LogContext.PushProperty("CorrelationId", correlationId))
            {
                return _next(context);
            }
        }

        private string GetCorrelationId(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue(CorrelationIdHeader, out var correlationId))
            {
                return correlationId;
            }

            return Guid.NewGuid().ToString();
        }
    }
}
