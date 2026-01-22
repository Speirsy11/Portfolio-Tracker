"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, Loader2, Plus, Trash2 } from "lucide-react";

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

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WatchlistListProps {
  initialWatchlists: Watchlist[];
  onSelectWatchlist: (watchlistId: string) => void;
  selectedWatchlistId: string | null;
}

export function WatchlistList({
  initialWatchlists,
  onSelectWatchlist,
  selectedWatchlistId,
}: WatchlistListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [watchlistToDelete, setWatchlistToDelete] = useState<Watchlist | null>(
    null,
  );

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: watchlists } = useQuery({
    ...trpc.watchlists.list.queryOptions(),
    initialData: initialWatchlists,
  });

  const createMutation = useMutation({
    ...trpc.watchlists.create.mutationOptions(),
    onSuccess: async () => {
      setNewWatchlistName("");
      setShowCreateForm(false);
      toast.success("Watchlist created successfully");
      await queryClient.invalidateQueries({
        queryKey: trpc.watchlists.list.queryKey(),
      });
    },
    onError: (error) => {
      toast.error("Failed to create watchlist", {
        description: error.message,
      });
    },
    onSettled: () => setIsCreating(false),
  });

  const deleteMutation = useMutation({
    ...trpc.watchlists.delete.mutationOptions(),
    onSuccess: async () => {
      toast.success("Watchlist deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: trpc.watchlists.list.queryKey(),
      });
    },
    onError: (error) => {
      toast.error("Failed to delete watchlist", {
        description: error.message,
      });
    },
  });

  const handleCreate = () => {
    if (!newWatchlistName.trim()) return;
    setIsCreating(true);
    createMutation.mutate({ name: newWatchlistName.trim() });
  };

  const handleDeleteClick = (watchlist: Watchlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistToDelete(watchlist);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!watchlistToDelete) return;
    deleteMutation.mutate({ watchlistId: watchlistToDelete.id });
    if (selectedWatchlistId === watchlistToDelete.id) {
      onSelectWatchlist("");
    }
    setDeleteDialogOpen(false);
    setWatchlistToDelete(null);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <List className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Your Watchlists</CardTitle>
                <CardDescription>
                  Select a watchlist to view assets
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Watchlist name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          )}

          {watchlists.length > 0 ? (
            <div className="space-y-2">
              {watchlists.map((watchlist) => (
                <div
                  key={watchlist.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted ${
                    selectedWatchlistId === watchlist.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => onSelectWatchlist(watchlist.id)}
                >
                  <div>
                    <div className="font-medium">{watchlist.name}</div>
                    {watchlist.description && (
                      <div className="text-xs text-muted-foreground">
                        {watchlist.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(watchlist.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(watchlist, e)}
                    disabled={
                      isDeleting && watchlistToDelete?.id === watchlist.id
                    }
                    className="text-destructive hover:text-destructive"
                  >
                    {isDeleting && watchlistToDelete?.id === watchlist.id ? (
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
              No watchlists yet. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Watchlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{watchlistToDelete?.name}
              &quot;? This action cannot be undone and will remove all assets
              from this watchlist.
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
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
