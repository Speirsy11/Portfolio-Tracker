"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";

import { useTRPC } from "~/trpc/react";

export function PortfolioInsights() {
  const trpc = useTRPC();

  const { data: portfolioData, isLoading } = useQuery({
    ...trpc.insights.getPortfolioInsights.queryOptions({}),
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Your Portfolio</CardTitle>
            <CardDescription>Personalized insights</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {portfolioData?.assets && portfolioData.assets.length > 0 ? (
          <>
            {/* Insights */}
            {portfolioData.insights.length > 0 ? (
              <div className="space-y-3">
                {portfolioData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      insight.type === "bullish"
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-amber-500/30 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {insight.type === "bullish" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="font-medium">{insight.title}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                No specific alerts for your portfolio assets
              </div>
            )}

            {/* Portfolio Assets */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Your Assets
              </h4>
              {portfolioData.assets.slice(0, 5).map((asset) => {
                const score = Number(asset.latestSentiment?.score ?? 0);
                const isPositive = score > 0;
                const isBullish = score > 0.3;
                const isBearish = score < -0.3;

                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {asset.latestSentiment ? (
                        isBullish ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : isBearish ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <span className="h-4 w-4" />
                        )
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                      <span className="font-medium">{asset.symbol}</span>
                    </div>
                    {asset.latestSentiment ? (
                      <span
                        className={`font-medium ${
                          isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {score.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                );
              })}
              {portfolioData.assets.length > 5 && (
                <p className="text-center text-xs text-muted-foreground">
                  +{portfolioData.assets.length - 5} more assets
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No portfolio assets</p>
            <p className="text-sm">
              Add assets to your portfolio to see personalized insights
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
