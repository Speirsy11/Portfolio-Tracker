"use client";

import { Coins, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card";

const cryptoData = [
  {
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: 67234.56,
    change24h: 2.34,
    marketCap: 1318000000000,
    volume24h: 28500000000,
    icon: "₿",
  },
  {
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: 3456.78,
    change24h: -1.23,
    marketCap: 415000000000,
    volume24h: 15200000000,
    icon: "Ξ",
  },
  {
    rank: 3,
    name: "Tether",
    symbol: "USDT",
    price: 1.0,
    change24h: 0.01,
    marketCap: 98000000000,
    volume24h: 45000000000,
    icon: "₮",
  },
  {
    rank: 4,
    name: "BNB",
    symbol: "BNB",
    price: 589.23,
    change24h: 3.45,
    marketCap: 88000000000,
    volume24h: 1800000000,
    icon: "B",
  },
  {
    rank: 5,
    name: "Solana",
    symbol: "SOL",
    price: 145.67,
    change24h: 5.67,
    marketCap: 65000000000,
    volume24h: 2400000000,
    icon: "◎",
  },
  {
    rank: 6,
    name: "XRP",
    symbol: "XRP",
    price: 0.5234,
    change24h: -2.34,
    marketCap: 28000000000,
    volume24h: 1200000000,
    icon: "✕",
  },
  {
    rank: 7,
    name: "USD Coin",
    symbol: "USDC",
    price: 1.0,
    change24h: 0.0,
    marketCap: 25000000000,
    volume24h: 5600000000,
    icon: "$",
  },
  {
    rank: 8,
    name: "Cardano",
    symbol: "ADA",
    price: 0.4567,
    change24h: 1.89,
    marketCap: 16000000000,
    volume24h: 450000000,
    icon: "₳",
  },
  {
    rank: 9,
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.0789,
    change24h: 4.23,
    marketCap: 11000000000,
    volume24h: 890000000,
    icon: "Ð",
  },
  {
    rank: 10,
    name: "TRON",
    symbol: "TRX",
    price: 0.1234,
    change24h: -0.56,
    marketCap: 10800000000,
    volume24h: 320000000,
    icon: "T",
  },
];

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

export function CryptoList() {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="bg-chart-1/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Coins className="text-chart-1 h-5 w-5" />
          </div>
          <CardTitle className="text-xl">
            Top Cryptocurrencies by Market Cap
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                  24h %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                  Volume (24h)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cryptoData.map((crypto) => (
                <tr
                  key={crypto.rank}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {crypto.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {crypto.icon}
                      </div>
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-medium">
                    ${crypto.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${
                        crypto.change24h >= 0
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {crypto.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(crypto.change24h).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {formatNumber(crypto.marketCap)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                    {formatNumber(crypto.volume24h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
