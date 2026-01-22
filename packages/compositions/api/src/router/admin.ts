import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@portfolio/db";
import { Users } from "@portfolio/db/schema";
import { mockSettings } from "@portfolio/redis";

import { adminProcedure, protectedProcedure } from "../trpc";

export const adminRouter = {
  // Check if current user is admin (protected, not admin-only)
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select({ isAdmin: Users.isAdmin })
      .from(Users)
      .where(eq(Users.id, ctx.session.userId))
      .limit(1);
    return { isAdmin: user[0]?.isAdmin ?? false };
  }),

  // Get current mock settings (admin only)
  getMockSettings: adminProcedure.query(async () => {
    const settings = await mockSettings.get();
    return settings;
  }),

  // Toggle LLM mocking (admin only)
  setLlmMock: adminProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      const settings = await mockSettings.toggleLlmMock(input.enabled);
      return settings;
    }),
} satisfies TRPCRouterRecord;
