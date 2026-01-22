import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, desc, eq } from "@portfolio/db";
import {
  Assets,
  Users,
  WatchlistAssets,
  Watchlists,
} from "@portfolio/db/schema";

import { protectedProcedure } from "../trpc";

export const watchlistsRouter = {
  // List user's watchlists
  list: protectedProcedure.query(async ({ ctx }) => {
    const watchlists = await ctx.db
      .select()
      .from(Watchlists)
      .where(eq(Watchlists.userId, ctx.session.userId))
      .orderBy(desc(Watchlists.createdAt));

    return watchlists;
  }),

  // Get a single watchlist with its assets
  get: protectedProcedure
    .input(z.object({ watchlistId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const watchlist = await ctx.db
        .select()
        .from(Watchlists)
        .where(
          and(
            eq(Watchlists.id, input.watchlistId),
            eq(Watchlists.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!watchlist[0]) {
        return null;
      }

      const assets = await ctx.db
        .select({
          id: Assets.id,
          symbol: Assets.symbol,
          name: Assets.name,
          position: WatchlistAssets.position,
          addedAt: WatchlistAssets.createdAt,
        })
        .from(WatchlistAssets)
        .innerJoin(Assets, eq(WatchlistAssets.assetId, Assets.id))
        .where(eq(WatchlistAssets.watchlistId, input.watchlistId))
        .orderBy(asc(WatchlistAssets.position));

      return {
        ...watchlist[0],
        assets,
      };
    }),

  // Create a new watchlist
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(500).optional(),
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

      const [watchlist] = await ctx.db
        .insert(Watchlists)
        .values({
          userId: ctx.session.userId,
          name: input.name,
          description: input.description,
        })
        .returning();

      return watchlist;
    }),

  // Update a watchlist
  update: protectedProcedure
    .input(
      z.object({
        watchlistId: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { watchlistId, ...updates } = input;

      const [watchlist] = await ctx.db
        .update(Watchlists)
        .set(updates)
        .where(
          and(
            eq(Watchlists.id, watchlistId),
            eq(Watchlists.userId, ctx.session.userId),
          ),
        )
        .returning();

      return watchlist;
    }),

  // Delete a watchlist
  delete: protectedProcedure
    .input(z.object({ watchlistId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(Watchlists)
        .where(
          and(
            eq(Watchlists.id, input.watchlistId),
            eq(Watchlists.userId, ctx.session.userId),
          ),
        );

      return { success: true };
    }),

  // Add an asset to a watchlist
  addAsset: protectedProcedure
    .input(
      z.object({
        watchlistId: z.string().uuid(),
        symbol: z.string().min(1).max(20).toUpperCase(),
        name: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const watchlist = await ctx.db
        .select()
        .from(Watchlists)
        .where(
          and(
            eq(Watchlists.id, input.watchlistId),
            eq(Watchlists.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!watchlist[0]) {
        throw new Error("Watchlist not found");
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

      // Check if already in watchlist
      const existing = await ctx.db
        .select()
        .from(WatchlistAssets)
        .where(
          and(
            eq(WatchlistAssets.watchlistId, input.watchlistId),
            eq(WatchlistAssets.assetId, assetId),
          ),
        )
        .limit(1);

      if (existing[0]) {
        return { success: true, alreadyExists: true };
      }

      // Get max position
      const maxPosition = await ctx.db
        .select({ position: WatchlistAssets.position })
        .from(WatchlistAssets)
        .where(eq(WatchlistAssets.watchlistId, input.watchlistId))
        .orderBy(desc(WatchlistAssets.position))
        .limit(1);

      const newPosition = (maxPosition[0]?.position ?? -1) + 1;

      await ctx.db.insert(WatchlistAssets).values({
        watchlistId: input.watchlistId,
        assetId: assetId,
        position: newPosition,
      });

      return { success: true, alreadyExists: false };
    }),

  // Remove an asset from a watchlist
  removeAsset: protectedProcedure
    .input(
      z.object({
        watchlistId: z.string().uuid(),
        assetId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const watchlist = await ctx.db
        .select()
        .from(Watchlists)
        .where(
          and(
            eq(Watchlists.id, input.watchlistId),
            eq(Watchlists.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!watchlist[0]) {
        throw new Error("Watchlist not found");
      }

      await ctx.db
        .delete(WatchlistAssets)
        .where(
          and(
            eq(WatchlistAssets.watchlistId, input.watchlistId),
            eq(WatchlistAssets.assetId, input.assetId),
          ),
        );

      return { success: true };
    }),

  // Reorder assets in a watchlist
  reorderAssets: protectedProcedure
    .input(
      z.object({
        watchlistId: z.string().uuid(),
        assetIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const watchlist = await ctx.db
        .select()
        .from(Watchlists)
        .where(
          and(
            eq(Watchlists.id, input.watchlistId),
            eq(Watchlists.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!watchlist[0]) {
        throw new Error("Watchlist not found");
      }

      // Update positions
      await Promise.all(
        input.assetIds.map((assetId, index) =>
          ctx.db
            .update(WatchlistAssets)
            .set({ position: index })
            .where(
              and(
                eq(WatchlistAssets.watchlistId, input.watchlistId),
                eq(WatchlistAssets.assetId, assetId),
              ),
            ),
        ),
      );

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
