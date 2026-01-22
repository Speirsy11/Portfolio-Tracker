import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { portfolioRouter } from "./router/portfolio";
import { settingsRouter } from "./router/settings";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  portfolio: portfolioRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
