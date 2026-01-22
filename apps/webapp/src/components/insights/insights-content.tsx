"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";

import { useTRPC } from "~/trpc/react";
import { InsightsList } from "./insights-list";
import { MarketOverview } from "./market-overview";
import { PortfolioInsights } from "./portfolio-insights";

export function InsightsContent() {
  const trpc = useTRPC();

  const { data: marketOverview, isLoading: isLoadingMarket } = useQuery({
    ...trpc.insights.getMarketOverview.queryOptions(),
  });

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Market Sentiment</CardDescription>
            <CardTitle className="text-2xl">
              {isLoadingMarket ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : marketOverview?.stats.avgSentiment !== undefined ? (
                <>
                  {marketOverview.stats.avgSentiment > 0 ? (
                    <span className="flex items-center gap-2 text-green-500">
                      <TrendingUp className="h-5 w-5" />
                      Bullish
                    </span>
                  ) : marketOverview.stats.avgSentiment < 0 ? (
                    <span className="flex items-center gap-2 text-red-500">
                      <TrendingDown className="h-5 w-5" />
                      Bearish
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Neutral</span>
                  )}
                </>
              ) : (
                "N/A"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Based on {marketOverview?.stats.withSentiment ?? 0} assets
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Bullish Assets</CardDescription>
            <CardTitle className="text-2xl text-green-500">
              {isLoadingMarket ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (marketOverview?.stats.bullish ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Score above 0.3</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Bearish Assets</CardDescription>
            <CardTitle className="text-2xl text-red-500">
              {isLoadingMarket ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (marketOverview?.stats.bearish ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Score below -0.3</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Neutral Assets</CardDescription>
            <CardTitle className="text-2xl text-muted-foreground">
              {isLoadingMarket ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (marketOverview?.stats.neutral ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Score between -0.3 and 0.3
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <MarketOverview
            assets={marketOverview?.assets ?? []}
            isLoading={isLoadingMarket}
          />
          <InsightsList />
        </div>
        <div className="lg:col-span-1">
          <PortfolioInsights />
        </div>
      </div>
    </div>
  );
}
