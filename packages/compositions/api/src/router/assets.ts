import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq, ilike, or, sql } from "@portfolio/db";
import { Assets, SentimentLogs } from "@portfolio/db/schema";

import { publicProcedure } from "../trpc";

export const assetsRouter = {
  // Get asset by symbol
  getBySymbol: publicProcedure
    .input(z.object({ symbol: z.string().min(1).max(20) }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db
        .select()
        .from(Assets)
        .where(eq(Assets.symbol, input.symbol.toUpperCase()))
        .limit(1);

      if (!asset[0]) {
        return null;
      }

      // Get latest sentiment
      const latestSentiment = await ctx.db
        .select()
        .from(SentimentLogs)
        .where(eq(SentimentLogs.assetId, asset[0].id))
        .orderBy(desc(SentimentLogs.createdAt))
        .limit(1);

      return {
        ...asset[0],
        latestSentiment: latestSentiment[0] ?? null,
      };
    }),

  // Get asset by ID
  getById: publicProcedure
    .input(z.object({ assetId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db
        .select()
        .from(Assets)
        .where(eq(Assets.id, input.assetId))
        .limit(1);

      if (!asset[0]) {
        return null;
      }

      // Get latest sentiment
      const latestSentiment = await ctx.db
        .select()
        .from(SentimentLogs)
        .where(eq(SentimentLogs.assetId, asset[0].id))
        .orderBy(desc(SentimentLogs.createdAt))
        .limit(1);

      return {
        ...asset[0],
        latestSentiment: latestSentiment[0] ?? null,
      };
    }),

  // Get sentiment history for an asset
  getSentimentHistory: publicProcedure
    .input(
      z.object({
        assetId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db
        .select({
          id: SentimentLogs.id,
          score: SentimentLogs.score,
          summary: SentimentLogs.summary,
          createdAt: SentimentLogs.createdAt,
        })
        .from(SentimentLogs)
        .where(eq(SentimentLogs.assetId, input.assetId))
        .orderBy(desc(SentimentLogs.createdAt))
        .limit(input.limit);

      return logs.reverse();
    }),

  // Search assets
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const searchPattern = `%${input.query}%`;

      const assets = await ctx.db
        .select()
        .from(Assets)
        .where(
          or(
            ilike(Assets.symbol, searchPattern),
            ilike(Assets.name, searchPattern),
          ),
        )
        .limit(input.limit);

      return assets;
    }),

  // List all assets with pagination
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const assets = await ctx.db
        .select()
        .from(Assets)
        .orderBy(Assets.symbol)
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(Assets);

      const total = countResult[0]?.count ?? 0;

      // Get sentiment for each asset
      const assetsWithSentiment = await Promise.all(
        assets.map(async (asset) => {
          const latestSentiment = await ctx.db
            .select()
            .from(SentimentLogs)
            .where(eq(SentimentLogs.assetId, asset.id))
            .orderBy(desc(SentimentLogs.createdAt))
            .limit(1);

          return {
            ...asset,
            latestSentiment: latestSentiment[0] ?? null,
          };
        }),
      );

      return {
        assets: assetsWithSentiment,
        total,
        hasMore: input.offset + assets.length < total,
      };
    }),
} satisfies TRPCRouterRecord;
