"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";

import { useTRPC } from "~/trpc/react";
import { AssetSentimentChart } from "./asset-sentiment-chart";
import { AssetSentimentHistory } from "./asset-sentiment-history";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  latestSentiment: {
    id: string;
    assetId: string;
    score: string;
    summary: string | null;
    createdAt: Date;
  } | null;
}

interface AssetDetailContentProps {
  initialAsset: Asset;
}

export function AssetDetailContent({ initialAsset }: AssetDetailContentProps) {
  const trpc = useTRPC();

  const { data: asset } = useQuery({
    ...trpc.assets.getBySymbol.queryOptions({ symbol: initialAsset.symbol }),
    initialData: initialAsset,
  });

  const { data: sentimentHistory } = useQuery({
    ...trpc.assets.getSentimentHistory.queryOptions({
      assetId: initialAsset.id,
      limit: 30,
    }),
  });

  const score = asset?.latestSentiment
    ? Number(asset.latestSentiment.score)
    : null;
  const isBullish = score !== null && score > 0.3;
  const isBearish = score !== null && score < -0.3;
  const isPositive = score !== null && score > 0;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Markets
        </Button>
      </Link>

      {/* Asset Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                isBullish
                  ? "bg-green-500/10"
                  : isBearish
                    ? "bg-red-500/10"
                    : "bg-muted"
              }`}
            >
              {isBullish ? (
                <TrendingUp className="h-6 w-6 text-green-500" />
              ) : isBearish ? (
                <TrendingDown className="h-6 w-6 text-red-500" />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {asset?.symbol.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{asset?.symbol}</h1>
              <p className="text-muted-foreground">{asset?.name}</p>
            </div>
          </div>
        </div>

        {/* Sentiment Badge */}
        {score !== null && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">AI Sentiment</p>
              <p
                className={`text-2xl font-bold ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {score.toFixed(2)}
              </p>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isBullish
                  ? "bg-green-500/10 text-green-500"
                  : isBearish
                    ? "bg-red-500/10 text-red-500"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isBullish ? "Bullish" : isBearish ? "Bearish" : "Neutral"}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <AssetSentimentChart
            data={sentimentHistory ?? []}
            symbol={asset?.symbol ?? ""}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Latest Analysis */}
          {asset?.latestSentiment?.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest Analysis</CardTitle>
                <CardDescription>
                  {new Date(asset.latestSentiment.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {asset.latestSentiment.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Symbol</span>
                <span className="font-mono font-medium">{asset?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium">{asset?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Data Points
                </span>
                <span className="font-medium">
                  {sentimentHistory?.length ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sentiment History */}
      <AssetSentimentHistory data={sentimentHistory ?? []} />
    </div>
  );
}
