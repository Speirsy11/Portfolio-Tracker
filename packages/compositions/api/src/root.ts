import { adminRouter } from "./router/admin";
import { alertsRouter } from "./router/alerts";
import { authRouter } from "./router/auth";
import { insightsRouter } from "./router/insights";
import { portfolioRouter } from "./router/portfolio";
import { settingsRouter } from "./router/settings";
import { watchlistsRouter } from "./router/watchlists";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  alerts: alertsRouter,
  auth: authRouter,
  insights: insightsRouter,
  portfolio: portfolioRouter,
  settings: settingsRouter,
  watchlists: watchlistsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
