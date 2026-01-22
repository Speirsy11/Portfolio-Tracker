import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@portfolio/db";
import {
  PortfolioAssets,
  Portfolios,
  UserPreferences,
  Users,
} from "@portfolio/db/schema";

import { protectedProcedure } from "../trpc";

export const settingsRouter = {
  // Get user preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await ctx.db
      .select()
      .from(UserPreferences)
      .where(eq(UserPreferences.userId, ctx.session.userId))
      .limit(1);

    // Return default preferences if none exist
    if (!preferences[0]) {
      return {
        emailNotifications: true,
        pushNotifications: false,
        notificationFrequency: "daily",
        theme: "system",
        currency: "USD",
        profilePublic: false,
      };
    }

    return preferences[0];
  }),

  // Update preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        notificationFrequency: z
          .enum(["instant", "hourly", "daily", "weekly"])
          .optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
        currency: z.string().length(3).optional(),
        profilePublic: z.boolean().optional(),
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

      // Check if preferences exist
      const existing = await ctx.db
        .select({ id: UserPreferences.id })
        .from(UserPreferences)
        .where(eq(UserPreferences.userId, ctx.session.userId))
        .limit(1);

      if (existing[0]) {
        // Update existing preferences
        await ctx.db
          .update(UserPreferences)
          .set(input)
          .where(eq(UserPreferences.userId, ctx.session.userId));
      } else {
        // Create new preferences
        await ctx.db.insert(UserPreferences).values({
          userId: ctx.session.userId,
          ...input,
        });
      }

      return { success: true };
    }),

  // Get account info
  getAccountInfo: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select()
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .limit(1);

    if (!user[0]) {
      return null;
    }

    // Get portfolio count
    const portfolios = await ctx.db
      .select({ id: Portfolios.id })
      .from(Portfolios)
      .where(eq(Portfolios.userId, ctx.session.userId));

    // Get total assets across all portfolios
    let totalAssets = 0;
    for (const portfolio of portfolios) {
      const assets = await ctx.db
        .select({ id: PortfolioAssets.id })
        .from(PortfolioAssets)
        .where(eq(PortfolioAssets.portfolioId, portfolio.id));
      totalAssets += assets.length;
    }

    return {
      ...user[0],
      portfolioCount: portfolios.length,
      totalAssets,
    };
  }),

  // Export user data
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user info
    const user = await ctx.db
      .select()
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .limit(1);

    // Get preferences
    const preferences = await ctx.db
      .select()
      .from(UserPreferences)
      .where(eq(UserPreferences.userId, ctx.session.userId))
      .limit(1);

    // Get all portfolios with assets
    const portfolios = await ctx.db
      .select()
      .from(Portfolios)
      .where(eq(Portfolios.userId, ctx.session.userId));

    const portfoliosWithAssets = await Promise.all(
      portfolios.map(async (portfolio) => {
        const assets = await ctx.db
          .select()
          .from(PortfolioAssets)
          .where(eq(PortfolioAssets.portfolioId, portfolio.id));
        return { ...portfolio, assets };
      }),
    );

    return {
      exportedAt: new Date().toISOString(),
      user: user[0] ?? null,
      preferences: preferences[0] ?? null,
      portfolios: portfoliosWithAssets,
    };
  }),

  // Delete account (this just removes user data from our DB, Clerk handles the actual account)
  deleteAccountData: protectedProcedure.mutation(async ({ ctx }) => {
    // Due to cascade delete, deleting the user will delete:
    // - All portfolios
    // - All portfolio assets
    // - User preferences
    await ctx.db.delete(Users).where(eq(Users.id, ctx.session.userId));

    return { success: true };
  }),
} satisfies TRPCRouterRecord;
