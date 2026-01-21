"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card";

interface SentimentDataPoint {
  date: string;
  sentiment: number;
  summary?: string | null;
}

interface SentimentChartProps {
  data: SentimentDataPoint[];
  assetSymbol?: string;
}

export function SentimentChart({ data, assetSymbol }: SentimentChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      sentiment: Number(point.sentiment),
    }));
  }, [data]);

  const latestSentiment = chartData[chartData.length - 1]?.sentiment ?? 0;
  const sentimentLabel =
    latestSentiment > 0.3
      ? "Bullish"
      : latestSentiment < -0.3
        ? "Bearish"
        : "Neutral";
  const sentimentColor =
    latestSentiment > 0.3
      ? "text-green-500"
      : latestSentiment < -0.3
        ? "text-red-500"
        : "text-yellow-500";

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {assetSymbol ? `${assetSymbol} Sentiment` : "Sentiment Analysis"}
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {latestSentiment.toFixed(2)}
            </div>
            <div className={`text-sm ${sentimentColor}`}>{sentimentLabel}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="sentimentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#eab308" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[-1, 1]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => value.toFixed(1)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || payload.length === 0) {
                    return null;
                  }
                  const firstPayload = payload[0] as {
                    payload: SentimentDataPoint;
                  };
                  const data = firstPayload.payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                      <div className="text-sm font-medium">
                        Score: {Number(data.sentiment).toFixed(2)}
                      </div>
                      {data.summary && (
                        <div className="mt-1 max-w-xs text-xs text-muted-foreground">
                          {data.summary}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#sentimentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No sentiment data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
