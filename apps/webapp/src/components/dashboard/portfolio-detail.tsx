"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LineChart, Plus, Trash2 } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { Input } from "@portfolio/ui/input";

import { useTRPC } from "~/trpc/react";

interface PortfolioDetailProps {
  portfolioId: string;
  onSelectAsset: (assetId: string, symbol: string) => void;
  selectedAssetId: string | null;
}

export function PortfolioDetail({
  portfolioId,
  onSelectAsset,
  selectedAssetId,
}: PortfolioDetailProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading } = useQuery(
    trpc.portfolio.get.queryOptions({ portfolioId }),
  );

  const addAssetMutation = useMutation({
    ...trpc.portfolio.addAsset.mutationOptions(),
    onSuccess: async () => {
      setSymbol("");
      setName("");
      setShowAddForm(false);
      await queryClient.invalidateQueries({
        queryKey: trpc.portfolio.get.queryKey({ portfolioId }),
      });
    },
    onSettled: () => setIsAdding(false),
  });

  const removeAssetMutation = useMutation({
    ...trpc.portfolio.removeAsset.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.portfolio.get.queryKey({ portfolioId }),
      });
    },
  });

  const handleAddAsset = () => {
    if (!symbol.trim() || !name.trim()) return;
    setIsAdding(true);
    addAssetMutation.mutate({
      portfolioId,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
    });
  };

  const handleRemoveAsset = (assetId: string) => {
    if (confirm("Remove this asset from your portfolio?")) {
      removeAssetMutation.mutate({ portfolioId, assetId });
      if (selectedAssetId === assetId) {
        onSelectAsset("", "");
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Loading portfolio...</div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Portfolio not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LineChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{portfolio.name}</CardTitle>
              <CardDescription>
                {portfolio.assets.length} asset
                {portfolio.assets.length !== 1 ? "s" : ""} tracked
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-32"
              />
              <Input
                placeholder="Name (e.g., Apple Inc.)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button onClick={handleAddAsset} disabled={isAdding} size="sm">
              {isAdding ? "Adding..." : "Add to Portfolio"}
            </Button>
          </div>
        )}

        {portfolio.assets.length > 0 ? (
          <div className="space-y-2">
            {portfolio.assets.map((asset) => (
              <div
                key={asset.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted ${
                  selectedAssetId === asset.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => onSelectAsset(asset.id, asset.symbol)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.name}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAsset(asset.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No assets in this portfolio. Add some to start tracking sentiment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
