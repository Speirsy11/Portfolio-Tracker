import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { ilike, or } from "@portfolio/db";
import { Assets, MarketDataCache } from "@portfolio/db/schema";

import { publicProcedure } from "../trpc";

export interface TickerResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  isLocal: boolean;
}

export const tickersRouter = {
  // Search for tickers from local DB and cached market data (no external API calls)
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(50),
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }): Promise<TickerResult[]> => {
      const searchPattern = `%${input.query}%`;

      // Query local Assets table first (fast, user's saved assets)
      const localAssets = await ctx.db
        .select({
          symbol: Assets.symbol,
          name: Assets.name,
        })
        .from(Assets)
        .where(
          or(
            ilike(Assets.symbol, searchPattern),
            ilike(Assets.name, searchPattern),
          ),
        )
        .limit(input.limit);

      // Convert local assets to TickerResult format
      const localResults: TickerResult[] = localAssets.map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        type: "SAVED",
        exchange: "",
        isLocal: true,
      }));

      // Query cached market data instead of external API
      const cachedAssets = await ctx.db
        .select({
          symbol: MarketDataCache.symbol,
          name: MarketDataCache.name,
          assetType: MarketDataCache.assetType,
        })
        .from(MarketDataCache)
        .where(
          or(
            ilike(MarketDataCache.symbol, searchPattern),
            ilike(MarketDataCache.name, searchPattern),
          ),
        )
        .limit(input.limit);

      // Convert cached results to TickerResult format
      const cachedResults: TickerResult[] = cachedAssets.map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        type: asset.assetType === "crypto" ? "CRYPTOCURRENCY" : "EQUITY",
        exchange: "",
        isLocal: false,
      }));

      // Merge and deduplicate, prioritizing local assets
      const localSymbols = new Set(localResults.map((r) => r.symbol));
      const mergedResults: TickerResult[] = [
        ...localResults,
        ...cachedResults.filter((r) => !localSymbols.has(r.symbol)),
      ];

      // Return limited results
      return mergedResults.slice(0, input.limit);
    }),
} satisfies TRPCRouterRecord;
