import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { ilike, or } from "@portfolio/db";
import { Assets } from "@portfolio/db/schema";
import type { TickerSearchResult } from "@portfolio/finance";
import { yahooFinanceService } from "@portfolio/finance";

import { publicProcedure } from "../trpc";

export interface TickerResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  isLocal: boolean;
}

export const tickersRouter = {
  // Search for tickers from local DB and Yahoo Finance
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

      // Query Yahoo Finance for comprehensive results
      const yahooResults = await yahooFinanceService.searchTickers(input.query);

      // Convert Yahoo results to TickerResult format
      const externalResults: TickerResult[] = yahooResults.map(
        (result: TickerSearchResult) => ({
          ...result,
          isLocal: false,
        }),
      );

      // Merge and deduplicate, prioritizing local assets
      const localSymbols = new Set(localResults.map((r) => r.symbol));
      const mergedResults: TickerResult[] = [
        ...localResults,
        ...externalResults.filter((r) => !localSymbols.has(r.symbol)),
      ];

      // Return limited results
      return mergedResults.slice(0, input.limit);
    }),
} satisfies TRPCRouterRecord;
