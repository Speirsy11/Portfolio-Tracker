"use client";

import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  latestSentiment: {
    id: string;
    score: string;
    summary: string | null;
    createdAt: Date;
  } | null;
}

interface MarketOverviewProps {
  assets: Asset[];
  isLoading: boolean;
}

export function MarketOverview({ assets, isLoading }: MarketOverviewProps) {
  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const sortedAssets = [...assets]
    .filter((a) => a.latestSentiment)
    .sort(
      (a, b) =>
        Number(b.latestSentiment?.score ?? 0) -
        Number(a.latestSentiment?.score ?? 0),
    );

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl">Market Overview</CardTitle>
        <CardDescription>
          Asset sentiment rankings based on AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedAssets.length > 0 ? (
          <div className="space-y-3">
            {sortedAssets.slice(0, 10).map((asset) => {
              const score = Number(asset.latestSentiment?.score ?? 0);
              const isPositive = score > 0;
              const isBullish = score > 0.3;
              const isBearish = score < -0.3;

              return (
                <div
                  key={asset.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isBullish
                          ? "bg-green-500/10"
                          : isBearish
                            ? "bg-red-500/10"
                            : "bg-muted"
                      }`}
                    >
                      {isBullish ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : isBearish ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          -
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {score.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isBullish
                        ? "Bullish"
                        : isBearish
                          ? "Bearish"
                          : "Neutral"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No sentiment data available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
