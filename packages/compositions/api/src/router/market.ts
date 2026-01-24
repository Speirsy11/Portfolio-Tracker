import type { TRPCRouterRecord } from "@trpc/server";

import { sql } from "@portfolio/db";
import {
  Portfolios,
  PortfolioAssets,
  SentimentLogs,
  Users,
} from "@portfolio/db/schema";
import { yahooFinanceService } from "@portfolio/finance";

import { publicProcedure } from "../trpc";

// Crypto icon map for display purposes
const CRYPTO_ICONS: Record<string, string> = {
  "BTC-USD": "₿",
  "ETH-USD": "Ξ",
  "USDT-USD": "₮",
  "BNB-USD": "B",
  "SOL-USD": "◎",
};

export const marketRouter = {
  /**
   * Get top cryptocurrencies with live prices
   */
  getTopCryptos: publicProcedure.query(async () => {
    const quotes = await yahooFinanceService.getTopCryptos();

    // Add rank and icon to each quote
    return quotes.map((quote, index) => ({
      ...quote,
      rank: index + 1,
      icon: CRYPTO_ICONS[quote.symbol] ?? quote.symbol.charAt(0),
    }));
  }),

  /**
   * Get aggregated market statistics
   */
  getMarketStats: publicProcedure.query(async () => {
    const stats = await yahooFinanceService.getMarketStats();

    if (!stats) {
      // Return fallback values if API fails
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        btcDominance: 0,
        lastUpdated: new Date(),
        isStale: true,
      };
    }

    return {
      ...stats,
      isStale: false,
    };
  }),

  /**
   * Get platform statistics from the database
   */
  getPlatformStats: publicProcedure.query(async ({ ctx }) => {
    // Get total user count
    const userCountResult = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(Users);
    const userCount = userCountResult[0]?.count ?? 0;

    // Get total portfolio count
    const portfolioCountResult = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(Portfolios);
    const portfolioCount = portfolioCountResult[0]?.count ?? 0;

    // Get total assets tracked (unique assets in portfolios)
    const assetsTrackedResult = await ctx.db
      .select({ count: sql<number>`count(distinct asset_id)::int` })
      .from(PortfolioAssets);
    const assetsTracked = assetsTrackedResult[0]?.count ?? 0;

    // Get total AI analyses (sentiment logs)
    const sentimentCountResult = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(SentimentLogs);
    const sentimentCount = sentimentCountResult[0]?.count ?? 0;

    return {
      userCount,
      portfolioCount,
      assetsTracked,
      sentimentCount,
    };
  }),
} satisfies TRPCRouterRecord;
