import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { insightsRouter } from "./router/insights";
import { portfolioRouter } from "./router/portfolio";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  insights: insightsRouter,
  portfolio: portfolioRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
