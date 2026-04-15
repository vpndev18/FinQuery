using System;
using System.Collections.Generic;
using System.Linq;

public class Trade
{
    public int TradeId { get; set; }
    public string Symbol { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string TradeType { get; set; } // "BUY" or "SELL"
    public bool IsValid { get; set; } = true;
}

class Program
{
    static void Main(string[] args)
    {
        // Mocking a database table of trades
        var trades = new List<Trade>
        {
            new Trade { TradeId = 1, Symbol = "AAPL", Price = 150.50m, Quantity = 10, TradeType = "BUY" },
            new Trade { TradeId = 2, Symbol = "MSFT", Price = 300.00m, Quantity = 5, TradeType = "BUY" },
            new Trade { TradeId = 3, Symbol = "AAPL", Price = 155.00m, Quantity = 5, TradeType = "SELL" },
            new Trade { TradeId = 4, Symbol = "TSLA", Price = -100m, Quantity = 10, TradeType = "BUY" }, // Intentional Bad Data
            new Trade { TradeId = 5, Symbol = "MSFT", Price = 310.00m, Quantity = 0, TradeType = "SELL" }
        };

        Dictionary<string, List<Trade>> groupedTrades = GroupTrades(trades);

        foreach(var trade in groupedTrades) {
            Console.WriteLine($"Symbol: {trade.Key}, Number of Trades: {trade.Value.Count}");
        }

        ValidateTrades(trades);

        foreach (var tra in trades)
        {
            int res = PerProductPrice(tra.Price, tra.Quantity);
            Console.WriteLine(res);
        }

        List<Trade> aaplTrades = GetTradesBySymbol(trades, "AAPL");

        foreach(var tra in aaplTrades)
        {
            Console.WriteLine($"Trade ID: {tra.TradeId}, Symbol: {tra.Symbol}, Price: {tra.Price}, Quantity: {tra.Quantity}, Type: {tra.TradeType}, Valid: {tra.IsValid}");
        }

        int totalPriceAAPL = AggregationPriceBySymbol("AAPL", trades);
        Console.WriteLine(totalPriceAAPL);
    }

    public static Dictionary<string, List<Trade>> GroupTrades(List<Trade> tra)
    {
        return tra.GroupBy(t => t.Symbol)
                  .ToDictionary(g => g.Key, g => g.ToList());
    }

    public static void ValidateTrades(List<Trade> trades)
    {
        foreach (var trade in trades)
        {
            if (trade.Price <= 0 || trade.Quantity <= 0)
            {
                trade.IsValid = false;
                Console.WriteLine($"Trade ID {trade.TradeId} is invalid due to negative price or quantity.");
            }
        }
    }

    public static int PerProductPrice(decimal price,int qua)
    {
        try
        {
            return Convert.ToInt32(price/qua);
        }
        catch(Exception ex)
        {
            Console.WriteLine($"Error calculating price: {ex.Message}");
        }

        return 0;
    }

    public static List<Trade> GetTradesBySymbol(List<Trade> trades, string symbol)
    {
        return trades.Where(t => t.Symbol == symbol).ToList();
    }

    public static int AggregationPriceBySymbol(string symbol,List<Trade> tra)
    {
        try
        {
            return Convert.ToInt32(tra.Where(t => t.Symbol == symbol).Sum(t => t.Price * t.Quantity));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error calculating aggregation price: {ex.Message}");
        }
        return 0;
    }

    public static int CurrentShares(List<Trade> tra)
    {
        int buyquatity = tra.Where(t => t.TradeType == "BUY").Sum(t => t.Quantity);
        int sellquantity = tra.Where(t => t.TradeType == "SELL").Sum(t => t.Quantity);
        return buyquatity - sellquantity;
    }

}


