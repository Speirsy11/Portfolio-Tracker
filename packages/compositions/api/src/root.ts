import { adminRouter } from "./router/admin";
import { alertsRouter } from "./router/alerts";
import { assetsRouter } from "./router/assets";
import { authRouter } from "./router/auth";
import { insightsRouter } from "./router/insights";
import { marketRouter } from "./router/market";
import { portfolioRouter } from "./router/portfolio";
import { settingsRouter } from "./router/settings";
import { tickersRouter } from "./router/tickers";
import { watchlistsRouter } from "./router/watchlists";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  assets: assetsRouter,
  alerts: alertsRouter,
  auth: authRouter,
  insights: insightsRouter,
  market: marketRouter,
  portfolio: portfolioRouter,
  settings: settingsRouter,
  tickers: tickersRouter,
  watchlists: watchlistsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

