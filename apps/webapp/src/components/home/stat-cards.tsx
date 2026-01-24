"use client";

import { Activity, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@portfolio/ui/card";
import { Skeleton } from "@portfolio/ui/skeleton";

import { useTRPC } from "~/trpc/react";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

function StatCardSkeleton() {
  return (
    <Card className="hover-lift border-border bg-card/50 backdrop-blur-sm transition-colors hover:border-accent/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketStats() {
  const trpc = useTRPC();

  const { data: marketStats, isLoading } = useQuery({
    ...trpc.market.getMarketStats.queryOptions(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !marketStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Market Cap",
      value: formatNumber(marketStats.totalMarketCap),
      change: marketStats.isStale ? "Updating..." : "Top 5 Cryptos",
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: "24h Trading Volume",
      value: formatNumber(marketStats.totalVolume24h),
      change: "Last 24 hours",
      isPositive: true,
      icon: Activity,
    },
    {
      label: "BTC Dominance",
      value: `${marketStats.btcDominance.toFixed(1)}%`,
      change: "vs Top 5",
      isPositive: marketStats.btcDominance > 50,
      icon: marketStats.btcDominance > 50 ? TrendingUp : TrendingDown,
    },
    {
      label: "Last Updated",
      value: new Date(marketStats.lastUpdated).toLocaleTimeString(),
      change: "Live Data",
      isPositive: true,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="hover-lift border-border bg-card/50 backdrop-blur-sm transition-colors hover:border-accent/30"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.isPositive ? (
                      <TrendingUp className="text-success h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span
                      className={`text-sm font-medium ${stat.isPositive ? "text-success" : "text-destructive"}`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-accent/10 p-3">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
