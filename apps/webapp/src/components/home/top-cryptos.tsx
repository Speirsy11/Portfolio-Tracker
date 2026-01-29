"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Coins, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card";
import { Skeleton } from "@portfolio/ui/skeleton";

import { useTRPC } from "~/trpc/react";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function TableRowSkeleton() {
  return (
    <tr className="transition-colors hover:bg-muted/50">
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-4" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton className="ml-auto h-4 w-24" />
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton className="ml-auto h-6 w-16 rounded-md" />
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton className="ml-auto h-4 w-20" />
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton className="ml-auto h-4 w-20" />
      </td>
    </tr>
  );
}

export function CryptoList() {
  const trpc = useTRPC();

  const { data: cryptoResponse, isLoading } = useQuery({
    ...trpc.market.getTopCryptos.queryOptions(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const cryptoData = cryptoResponse?.cryptos;
  const lastUpdated = cryptoResponse?.lastUpdated
    ? new Date(cryptoResponse.lastUpdated)
    : null;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-chart-1/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <Coins className="text-chart-1 h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Top Cryptocurrencies by Market Cap
              </CardTitle>
              {lastUpdated && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatRelativeTime(lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
          <a
            href="/wip"
            className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            View All →
          </a>
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
              {isLoading || !cryptoData ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : (
                cryptoData.map((crypto) => (
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
                            {crypto.symbol.replace("-USD", "")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-medium">
                      $
                      {crypto.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${
                          crypto.changePercent24h >= 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {crypto.changePercent24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(crypto.changePercent24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">
                      {formatNumber(crypto.marketCap)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                      {formatNumber(crypto.volume24h)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
