import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, desc, eq } from "@portfolio/db";
import { Assets, PriceAlerts, Users } from "@portfolio/db/schema";

import { protectedProcedure } from "../trpc";

export const alertsRouter = {
  // List user's alerts
  list: protectedProcedure.query(async ({ ctx }) => {
    const alerts = await ctx.db
      .select({
        id: PriceAlerts.id,
        assetId: PriceAlerts.assetId,
        targetPrice: PriceAlerts.targetPrice,
        condition: PriceAlerts.condition,
        isActive: PriceAlerts.isActive,
        triggeredAt: PriceAlerts.triggeredAt,
        createdAt: PriceAlerts.createdAt,
        asset: {
          id: Assets.id,
          symbol: Assets.symbol,
          name: Assets.name,
        },
      })
      .from(PriceAlerts)
      .innerJoin(Assets, eq(PriceAlerts.assetId, Assets.id))
      .where(eq(PriceAlerts.userId, ctx.session.userId))
      .orderBy(desc(PriceAlerts.createdAt));

    return alerts;
  }),

  // Get a single alert
  get: protectedProcedure
    .input(z.object({ alertId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const alert = await ctx.db
        .select({
          id: PriceAlerts.id,
          assetId: PriceAlerts.assetId,
          targetPrice: PriceAlerts.targetPrice,
          condition: PriceAlerts.condition,
          isActive: PriceAlerts.isActive,
          triggeredAt: PriceAlerts.triggeredAt,
          createdAt: PriceAlerts.createdAt,
          asset: {
            id: Assets.id,
            symbol: Assets.symbol,
            name: Assets.name,
          },
        })
        .from(PriceAlerts)
        .innerJoin(Assets, eq(PriceAlerts.assetId, Assets.id))
        .where(
          and(
            eq(PriceAlerts.id, input.alertId),
            eq(PriceAlerts.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      return alert[0] ?? null;
    }),

  // Create a new alert
  create: protectedProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(20).toUpperCase(),
        name: z.string().min(1).max(255),
        targetPrice: z.number().positive(),
        condition: z.enum(["above", "below"]),
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

      const [alert] = await ctx.db
        .insert(PriceAlerts)
        .values({
          userId: ctx.session.userId,
          assetId,
          name: input.name,
          targetPrice: input.targetPrice.toString(),
          condition: input.condition,
        })
        .returning();

      return alert;
    }),

  // Update an alert
  update: protectedProcedure
    .input(
      z.object({
        alertId: z.uuid(),
        targetPrice: z.number().positive().optional(),
        condition: z.enum(["above", "below"]).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { alertId, ...updates } = input;

      // Build update object
      const updateValues: Record<string, unknown> = {};
      if (updates.targetPrice !== undefined) {
        updateValues.targetPrice = updates.targetPrice.toString();
      }
      if (updates.condition !== undefined) {
        updateValues.condition = updates.condition;
      }
      if (updates.isActive !== undefined) {
        updateValues.isActive = updates.isActive;
        // Reset triggeredAt if re-activating
        if (updates.isActive) {
          updateValues.triggeredAt = null;
        }
      }

      const [alert] = await ctx.db
        .update(PriceAlerts)
        .set(updateValues)
        .where(
          and(
            eq(PriceAlerts.id, alertId),
            eq(PriceAlerts.userId, ctx.session.userId),
          ),
        )
        .returning();

      return alert;
    }),

  // Delete an alert
  delete: protectedProcedure
    .input(z.object({ alertId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(PriceAlerts)
        .where(
          and(
            eq(PriceAlerts.id, input.alertId),
            eq(PriceAlerts.userId, ctx.session.userId),
          ),
        );

      return { success: true };
    }),

  // Toggle alert active status
  toggle: protectedProcedure
    .input(z.object({ alertId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get current status
      const existing = await ctx.db
        .select({ isActive: PriceAlerts.isActive })
        .from(PriceAlerts)
        .where(
          and(
            eq(PriceAlerts.id, input.alertId),
            eq(PriceAlerts.userId, ctx.session.userId),
          ),
        )
        .limit(1);

      if (!existing[0]) {
        throw new Error("Alert not found");
      }

      const newStatus = !existing[0].isActive;

      const [alert] = await ctx.db
        .update(PriceAlerts)
        .set({
          isActive: newStatus,
          triggeredAt: newStatus ? null : undefined,
        })
        .where(
          and(
            eq(PriceAlerts.id, input.alertId),
            eq(PriceAlerts.userId, ctx.session.userId),
          ),
        )
        .returning();

      if (!alert) {
        throw new Error("Failed to toggle alert");
      }

      return alert;
    }),
} satisfies TRPCRouterRecord;
