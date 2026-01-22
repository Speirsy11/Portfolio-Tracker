import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, desc, eq, sql } from "@portfolio/db";
import {
  AiInsights,
  Assets,
  InsightFeedback,
  PortfolioAssets,
  Portfolios,
  SentimentLogs,
  Users,
} from "@portfolio/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const insightsRouter = {
  // Get recent market insights (public)
  getMarketInsights: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const insights = await ctx.db
        .select()
        .from(AiInsights)
        .where(eq(AiInsights.type, "market_summary"))
        .orderBy(desc(AiInsights.createdAt))
        .limit(input.limit);

      return insights;
    }),

  // Get personalized insights for a user (protected)
  getPersonalizedInsights: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const insights = await ctx.db
        .select()
        .from(AiInsights)
        .where(eq(AiInsights.userId, ctx.session.userId))
        .orderBy(desc(AiInsights.createdAt))
        .limit(input.limit);

      return insights;
    }),

  // Get all insights (public market + user's personalized)
  getAllInsights: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        type: z
          .enum([
            "all",
            "market_summary",
            "recommendation",
            "portfolio_analysis",
          ])
          .default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.type !== "all") {
        return ctx.db
          .select()
          .from(AiInsights)
          .where(eq(AiInsights.type, input.type))
          .orderBy(desc(AiInsights.createdAt))
          .limit(input.limit);
      }

      return ctx.db
        .select()
        .from(AiInsights)
        .orderBy(desc(AiInsights.createdAt))
        .limit(input.limit);
    }),

  // Get a single insight
  getInsight: publicProcedure
    .input(z.object({ insightId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const insight = await ctx.db
        .select()
        .from(AiInsights)
        .where(eq(AiInsights.id, input.insightId))
        .limit(1);

      return insight[0] ?? null;
    }),

  // Submit feedback for an insight
  submitFeedback: protectedProcedure
    .input(
      z.object({
        insightId: z.string().uuid(),
        isHelpful: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Ensure user exists in local DB
      const userExists = await ctx.db
        .select({ id: Users.id })
        .from(Users)
        .where(eq(Users.id, ctx.session.userId))
        .limit(1);

      if (!userExists[0]) {
        const { currentUser } = await import("@portfolio/auth");
        const clerkUser = await currentUser();

        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          const name = [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ");

          if (email) {
            await ctx.db
              .insert(Users)
              .values({
                id: ctx.session.userId,
                email,
                name: name || "User",
              })
              .onConflictDoNothing();
          }
        }
      }

      // Check if user already submitted feedback
      const existingFeedback = await ctx.db
        .select()
        .from(InsightFeedback)
        .where(
          and(
            eq(InsightFeedback.insightId, input.insightId),
            eq(InsightFeedback.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (existingFeedback[0]) {
        // Update existing feedback
        const previouslyHelpful = existingFeedback[0].isHelpful;

        if (previouslyHelpful !== input.isHelpful) {
          // Change vote
          await ctx.db
            .update(InsightFeedback)
            .set({ isHelpful: input.isHelpful })
            .where(eq(InsightFeedback.id, existingFeedback[0].id));

          // Update counts
          if (input.isHelpful) {
            await ctx.db
              .update(AiInsights)
              .set({
                helpfulVotes: sql`${AiInsights.helpfulVotes} + 1`,
                notHelpfulVotes: sql`${AiInsights.notHelpfulVotes} - 1`,
              })
              .where(eq(AiInsights.id, input.insightId));
          } else {
            await ctx.db
              .update(AiInsights)
              .set({
                helpfulVotes: sql`${AiInsights.helpfulVotes} - 1`,
                notHelpfulVotes: sql`${AiInsights.notHelpfulVotes} + 1`,
              })
              .where(eq(AiInsights.id, input.insightId));
          }
        }

        return {
          success: true,
          changed: previouslyHelpful !== input.isHelpful,
        };
      }

      // Create new feedback
      await ctx.db.insert(InsightFeedback).values({
        insightId: input.insightId,
        userId: ctx.session.userId,
        isHelpful: input.isHelpful,
      });

      // Update counts
      if (input.isHelpful) {
        await ctx.db
          .update(AiInsights)
          .set({
            helpfulVotes: sql`${AiInsights.helpfulVotes} + 1`,
          })
          .where(eq(AiInsights.id, input.insightId));
      } else {
        await ctx.db
          .update(AiInsights)
          .set({
            notHelpfulVotes: sql`${AiInsights.notHelpfulVotes} + 1`,
          })
          .where(eq(AiInsights.id, input.insightId));
      }

      return { success: true, changed: true };
    }),

  // Get user's feedback for an insight
  getUserFeedback: protectedProcedure
    .input(z.object({ insightId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const feedback = await ctx.db
        .select()
        .from(InsightFeedback)
        .where(
          and(
            eq(InsightFeedback.insightId, input.insightId),
            eq(InsightFeedback.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      return feedback[0] ?? null;
    }),

  // Get market overview data (sentiment aggregation)
  getMarketOverview: publicProcedure.query(async ({ ctx }) => {
    // Get all assets with their latest sentiment
    const assets = await ctx.db.select().from(Assets).limit(20);

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

    // Calculate market stats
    const withSentiment = assetsWithSentiment.filter((a) => a.latestSentiment);
    const avgSentiment =
      withSentiment.length > 0
        ? withSentiment.reduce(
            (sum, a) => sum + Number(a.latestSentiment?.score ?? 0),
            0,
          ) / withSentiment.length
        : 0;

    const bullish = withSentiment.filter(
      (a) => Number(a.latestSentiment?.score ?? 0) > 0.3,
    ).length;
    const bearish = withSentiment.filter(
      (a) => Number(a.latestSentiment?.score ?? 0) < -0.3,
    ).length;
    const neutral = withSentiment.length - bullish - bearish;

    return {
      assets: assetsWithSentiment,
      stats: {
        totalAssets: assets.length,
        withSentiment: withSentiment.length,
        avgSentiment,
        bullish,
        bearish,
        neutral,
      },
    };
  }),

  // Get portfolio-specific insights
  getPortfolioInsights: protectedProcedure
    .input(z.object({ portfolioId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      // Get user's portfolio assets
      let portfolioAssets;

      if (input.portfolioId) {
        // Get specific portfolio
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
          return { assets: [], insights: [] };
        }

        portfolioAssets = await ctx.db
          .select({
            id: Assets.id,
            symbol: Assets.symbol,
            name: Assets.name,
          })
          .from(PortfolioAssets)
          .innerJoin(Assets, eq(PortfolioAssets.assetId, Assets.id))
          .where(eq(PortfolioAssets.portfolioId, input.portfolioId));
      } else {
        // Get all user's portfolio assets
        const userPortfolios = await ctx.db
          .select({ id: Portfolios.id })
          .from(Portfolios)
          .where(eq(Portfolios.userId, ctx.session.userId));

        if (userPortfolios.length === 0) {
          return { assets: [], insights: [] };
        }

        const allAssets = await Promise.all(
          userPortfolios.map(async (p) => {
            const assets = await ctx.db
              .select({
                id: Assets.id,
                symbol: Assets.symbol,
                name: Assets.name,
              })
              .from(PortfolioAssets)
              .innerJoin(Assets, eq(PortfolioAssets.assetId, Assets.id))
              .where(eq(PortfolioAssets.portfolioId, p.id));
            return assets;
          }),
        );

        portfolioAssets = allAssets.flat();
      }

      // Get sentiment for each asset
      const assetsWithSentiment = await Promise.all(
        portfolioAssets.map(async (asset) => {
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

      // Generate insights based on sentiment
      const insights: { type: string; title: string; description: string }[] =
        [];

      const bullishAssets = assetsWithSentiment.filter(
        (a) => Number(a.latestSentiment?.score ?? 0) > 0.3,
      );
      const bearishAssets = assetsWithSentiment.filter(
        (a) => Number(a.latestSentiment?.score ?? 0) < -0.3,
      );

      if (bullishAssets.length > 0) {
        insights.push({
          type: "bullish",
          title: "Positive Momentum",
          description: `${bullishAssets.map((a) => a.symbol).join(", ")} showing bullish sentiment`,
        });
      }

      if (bearishAssets.length > 0) {
        insights.push({
          type: "bearish",
          title: "Watch List",
          description: `${bearishAssets.map((a) => a.symbol).join(", ")} showing bearish sentiment - consider reviewing`,
        });
      }

      return {
        assets: assetsWithSentiment,
        insights,
      };
    }),
} satisfies TRPCRouterRecord;
