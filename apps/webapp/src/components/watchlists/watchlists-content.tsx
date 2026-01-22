"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { WatchlistDetail } from "./watchlist-detail";
import { WatchlistList } from "./watchlist-list";

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WatchlistsContentProps {
  initialWatchlists: Watchlist[];
}

export function WatchlistsContent({
  initialWatchlists,
}: WatchlistsContentProps) {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(
    initialWatchlists[0]?.id ?? null,
  );

  const trpc = useTRPC();

  const { data: watchlists } = useQuery({
    ...trpc.watchlists.list.queryOptions(),
    initialData: initialWatchlists,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <WatchlistList
          initialWatchlists={watchlists}
          onSelectWatchlist={setSelectedWatchlistId}
          selectedWatchlistId={selectedWatchlistId}
        />
      </div>
      <div className="lg:col-span-2">
        {selectedWatchlistId ? (
          <WatchlistDetail watchlistId={selectedWatchlistId} />
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No Watchlist Selected</p>
              <p className="text-sm">
                Create or select a watchlist to view assets
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
