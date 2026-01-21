import type { TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Assets,
  PortfolioAssets,
  Portfolios,
  SentimentLogs,
} from "@portfolio/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const portfolioRouter = {
  // List user's portfolios
  list: protectedProcedure.query(async ({ ctx }) => {
    const portfolios = await ctx.db
      .select()
      .from(Portfolios)
      .where(eq(Portfolios.userId, ctx.session.userId))
      .orderBy(desc(Portfolios.createdAt));

    return portfolios;
  }),

  // Get a single portfolio with its assets
  get: protectedProcedure
    .input(z.object({ portfolioId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const portfolio = await ctx.db
        .select()
        .from(Portfolios)
        .where(
          and(
            eq(Portfolios.id, input.portfolioId),
            eq(Portfolios.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!portfolio[0]) {
        return null;
      }

      const assets = await ctx.db
        .select({
          id: Assets.id,
          symbol: Assets.symbol,
          name: Assets.name,
          addedAt: PortfolioAssets.createdAt,
        })
        .from(PortfolioAssets)
        .innerJoin(Assets, eq(PortfolioAssets.assetId, Assets.id))
        .where(eq(PortfolioAssets.portfolioId, input.portfolioId));

      return {
        ...portfolio[0],
        assets,
      };
    }),

  // Create a new portfolio
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const [portfolio] = await ctx.db
        .insert(Portfolios)
        .values({
          userId: ctx.session.userId,
          name: input.name,
        })
        .returning();

      return portfolio;
    }),

  // Delete a portfolio
  delete: protectedProcedure
    .input(z.object({ portfolioId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(Portfolios)
        .where(
          and(
            eq(Portfolios.id, input.portfolioId),
            eq(Portfolios.userId, ctx.session.userId),
          ),
        );

      return { success: true };
    }),

  // Add an asset to a portfolio
  addAsset: protectedProcedure
    .input(
      z.object({
        portfolioId: z.string().uuid(),
        symbol: z.string().min(1).max(20).toUpperCase(),
        name: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const portfolio = await ctx.db
        .select()
        .from(Portfolios)
        .where(
          and(
            eq(Portfolios.id, input.portfolioId),
            eq(Portfolios.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!portfolio[0]) {
        throw new Error("Portfolio not found");
      }

      // Create or get asset
      const existingAsset = await ctx.db
        .select()
        .from(Assets)
        .where(eq(Assets.symbol, input.symbol))
        .limit(1);

      let assetId: string;
      if (existingAsset[0]) {
        assetId = existingAsset[0].id;
      } else {
        const [newAsset] = await ctx.db
          .insert(Assets)
          .values({
            symbol: input.symbol,
            name: input.name,
          })
          .returning();

        if (!newAsset) {
          throw new Error("Failed to create asset");
        }
        assetId = newAsset.id;
      }

      // Check if already in portfolio
      const existing = await ctx.db
        .select()
        .from(PortfolioAssets)
        .where(
          and(
            eq(PortfolioAssets.portfolioId, input.portfolioId),
            eq(PortfolioAssets.assetId, assetId),
          ),
        )
        .limit(1);

      if (existing[0]) {
        return { success: true, alreadyExists: true };
      }

      await ctx.db.insert(PortfolioAssets).values({
        portfolioId: input.portfolioId,
        assetId: assetId,
      });

      return { success: true, alreadyExists: false };
    }),

  // Remove an asset from a portfolio
  removeAsset: protectedProcedure
    .input(
      z.object({
        portfolioId: z.string().uuid(),
        assetId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const portfolio = await ctx.db
        .select()
        .from(Portfolios)
        .where(
          and(
            eq(Portfolios.id, input.portfolioId),
            eq(Portfolios.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!portfolio[0]) {
        throw new Error("Portfolio not found");
      }

      await ctx.db
        .delete(PortfolioAssets)
        .where(
          and(
            eq(PortfolioAssets.portfolioId, input.portfolioId),
            eq(PortfolioAssets.assetId, input.assetId),
          ),
        );

      return { success: true };
    }),

  // Get sentiment data for an asset
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

  // Get all assets with their latest sentiment
  getAssetsWithSentiment: publicProcedure.query(async ({ ctx }) => {
    const assets = await ctx.db.select().from(Assets);

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

    return assetsWithSentiment;
  }),
} satisfies TRPCRouterRecord;
