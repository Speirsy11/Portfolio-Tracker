"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { PortfolioDetail } from "./portfolio-detail";
import { PortfolioList } from "./portfolio-list";
import { SentimentChart } from "./sentiment-chart";

interface Portfolio {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SentimentLog {
  id: string;
  score: string;
  summary: string | null;
  createdAt: Date;
}

interface DashboardContentProps {
  initialPortfolios: Portfolio[];
}

export function DashboardContent({ initialPortfolios }: DashboardContentProps) {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(
    initialPortfolios[0]?.id ?? null,
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>("");

  const trpc = useTRPC();

  const { data: sentimentData } = useQuery({
    ...trpc.portfolio.getSentimentHistory.queryOptions({
      assetId: selectedAssetId ?? "",
      limit: 30,
    }),
    enabled: !!selectedAssetId,
  });

  const chartData = useMemo(() => {
    if (!sentimentData) return [];
    return sentimentData.map((log: SentimentLog) => ({
      date: new Date(log.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sentiment: Number(log.score),
      summary: log.summary,
    }));
  }, [sentimentData]);

  const handleSelectAsset = (assetId: string, symbol: string) => {
    setSelectedAssetId(assetId || null);
    setSelectedAssetSymbol(symbol);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-1">
        <PortfolioList
          initialPortfolios={initialPortfolios}
          onSelectPortfolio={setSelectedPortfolioId}
          selectedPortfolioId={selectedPortfolioId}
        />
      </div>

      <div className="space-y-8 lg:col-span-2">
        {selectedPortfolioId ? (
          <>
            <PortfolioDetail
              portfolioId={selectedPortfolioId}
              onSelectAsset={handleSelectAsset}
              selectedAssetId={selectedAssetId}
            />

            <SentimentChart
              data={chartData}
              assetSymbol={selectedAssetSymbol || undefined}
            />
          </>
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No Portfolio Selected</p>
              <p className="text-sm">
                Create or select a portfolio to view sentiment data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
