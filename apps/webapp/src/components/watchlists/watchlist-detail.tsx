"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";

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

interface WatchlistDetailProps {
  watchlistId: string;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  position: number;
  addedAt: Date;
}

export function WatchlistDetail({ watchlistId }: WatchlistDetailProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    ...trpc.watchlists.get.queryOptions({ watchlistId }),
    enabled: !!watchlistId,
  });

  const addAssetMutation = useMutation({
    ...trpc.watchlists.addAsset.mutationOptions(),
    onSuccess: async (result) => {
      if (result.alreadyExists) {
        toast.info("Asset already in watchlist");
      } else {
        toast.success("Asset added to watchlist");
      }
      setNewSymbol("");
      setNewName("");
      setShowAddForm(false);
      await queryClient.invalidateQueries({
        queryKey: trpc.watchlists.get.queryKey({ watchlistId }),
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
    ...trpc.watchlists.removeAsset.mutationOptions(),
    onSuccess: async () => {
      toast.success("Asset removed from watchlist");
      await queryClient.invalidateQueries({
        queryKey: trpc.watchlists.get.queryKey({ watchlistId }),
      });
    },
    onError: (error) => {
      toast.error("Failed to remove asset", {
        description: error.message,
      });
    },
  });

  const handleAddAsset = () => {
    if (!newSymbol.trim()) return;
    setIsAdding(true);
    addAssetMutation.mutate({
      watchlistId,
      symbol: newSymbol.trim().toUpperCase(),
      name: newName.trim() || newSymbol.trim().toUpperCase(),
    });
  };

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!assetToDelete) return;
    removeAssetMutation.mutate({
      watchlistId,
      assetId: assetToDelete.id,
    });
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  const isDeleting = removeAssetMutation.isPending;

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!watchlist) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Watchlist not found</p>
          </div>
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
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{watchlist.name}</CardTitle>
                <CardDescription>
                  {watchlist.assets.length} asset
                  {watchlist.assets.length !== 1 ? "s" : ""} in watchlist
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
                  placeholder="Symbol (e.g., BTC-USD)"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Input
                  placeholder="Name (optional)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSymbol("");
                    setNewName("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAsset} disabled={isAdding} size="sm">
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </div>
          )}

          {watchlist.assets.length > 0 ? (
            <div className="space-y-2">
              {watchlist.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-xs font-semibold">
                        {asset.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(asset)}
                      disabled={isDeleting && assetToDelete?.id === asset.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDeleting && assetToDelete?.id === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No assets in this watchlist yet. Add some to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {assetToDelete?.symbol} from this
              watchlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
