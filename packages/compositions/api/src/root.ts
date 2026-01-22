import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { portfolioRouter } from "./router/portfolio";
import { watchlistsRouter } from "./router/watchlists";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  portfolio: portfolioRouter,
  watchlists: watchlistsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
