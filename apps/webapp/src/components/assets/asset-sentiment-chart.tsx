"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

interface AssetSentimentChartProps {
  data: SentimentData[];
  symbol: string;
}

type TimeRange = "7d" | "14d" | "30d" | "all";

export function AssetSentimentChart({
  data,
  symbol,
}: AssetSentimentChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filterDataByRange = (range: TimeRange) => {
    if (range === "all") return data;

    const now = new Date();
    const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return data.filter((d) => new Date(d.createdAt) >= cutoff);
  };

  const filteredData = filterDataByRange(timeRange);

  const chartData = filteredData.map((d) => ({
    date: new Date(d.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    score: Number(d.score),
    fullDate: new Date(d.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment History</CardTitle>
          <CardDescription>
            AI-generated sentiment scores over time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">
            No sentiment data available yet for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sentiment History</CardTitle>
            <CardDescription>
              AI-generated sentiment scores over time
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {(["7d", "14d", "30d", "all"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "all" ? "All" : range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">
              No data available for selected time range
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sentimentGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sentimentRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                domain={[-1, 1]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value: number) => value.toFixed(1)}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#sentimentGreen)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
