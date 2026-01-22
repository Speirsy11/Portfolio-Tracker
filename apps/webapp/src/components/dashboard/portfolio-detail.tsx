"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LineChart, Loader2, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@portfolio/ui/alert-dialog";
import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { Input } from "@portfolio/ui/input";
import { toast } from "@portfolio/ui/toast";

import { useTRPC } from "~/trpc/react";

interface Asset {
  id: string;
  symbol: string;
  name: string;
}

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
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [assetToRemove, setAssetToRemove] = useState<Asset | null>(null);

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
      toast.success("Asset added successfully");
      await queryClient.invalidateQueries({
        queryKey: trpc.portfolio.get.queryKey({ portfolioId }),
      });
    },
    onError: (error) => {
      toast.error("Failed to add asset", {
        description: error.message,
      });
    },
    onSettled: () => setIsAdding(false),
  });

  const removeAssetMutation = useMutation({
    ...trpc.portfolio.removeAsset.mutationOptions(),
    onSuccess: async () => {
      toast.success("Asset removed successfully");
      await queryClient.invalidateQueries({
        queryKey: trpc.portfolio.get.queryKey({ portfolioId }),
      });
    },
    onError: (error) => {
      toast.error("Failed to remove asset", {
        description: error.message,
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

  const handleRemoveClick = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssetToRemove(asset);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (!assetToRemove) return;
    removeAssetMutation.mutate({ portfolioId, assetId: assetToRemove.id });
    if (selectedAssetId === assetToRemove.id) {
      onSelectAsset("", "");
    }
    setRemoveDialogOpen(false);
    setAssetToRemove(null);
  };

  const isRemoving = removeAssetMutation.isPending;

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
    <>
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{asset.symbol}</span>
                        <Link
                          href={`/assets/${asset.symbol}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground transition-colors hover:text-primary"
                          title="View asset details"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {asset.name}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveClick(asset, e)}
                    disabled={isRemoving && assetToRemove?.id === asset.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {isRemoving && assetToRemove?.id === asset.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {assetToRemove?.symbol} (
              {assetToRemove?.name}) from this portfolio? You can add it back
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
