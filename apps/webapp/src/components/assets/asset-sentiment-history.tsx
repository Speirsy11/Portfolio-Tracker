"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";

interface SentimentData {
  id: string;
  score: string;
  summary: string | null;
  createdAt: Date;
}

interface AssetSentimentHistoryProps {
  data: SentimentData[];
}

export function AssetSentimentHistory({ data }: AssetSentimentHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (data.length === 0) {
    return null;
  }

  // Show last 5 items, or all if expanded
  const displayData = expanded
    ? [...data].reverse()
    : [...data].reverse().slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>
          Previous sentiment analyses and summaries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayData.map((item) => {
          const score = Number(item.score);
          const isBullish = score > 0.3;
          const isBearish = score < -0.3;
          const isPositive = score > 0;

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-lg border border-border p-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
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
                  <span className="text-sm font-medium text-muted-foreground">
                    -
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {score.toFixed(2)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isBullish
                          ? "bg-green-500/10 text-green-500"
                          : isBearish
                            ? "bg-red-500/10 text-red-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isBullish
                        ? "Bullish"
                        : isBearish
                          ? "Bearish"
                          : "Neutral"}
                    </span>
                  </div>
                </div>
                {item.summary && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {data.length > 5 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show All ({data.length} entries)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
