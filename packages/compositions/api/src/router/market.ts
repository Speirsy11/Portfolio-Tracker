import type { TRPCRouterRecord } from "@trpc/server";

import { desc, eq, sql } from "@portfolio/db";
import {
  MarketDataCache,
  MarketDataSyncLog,
  PortfolioAssets,
  Portfolios,
  SentimentLogs,
  Users,
} from "@portfolio/db/schema";

import { publicProcedure } from "../trpc";

// Crypto icon map for display purposes
const CRYPTO_ICONS: Record<string, string> = {
  "BTC/USD": "₿",
  "ETH/USD": "Ξ",
  "USDT/USD": "₮",
  "BNB/USD": "B",
  "SOL/USD": "◎",
  "XRP/USD": "X",
  "ADA/USD": "A",
  "DOGE/USD": "D",
};

export const marketRouter = {
  /**
   * Get top cryptocurrencies from database cache
   */
  getTopCryptos: publicProcedure.query(async ({ ctx }) => {
    // Query cached crypto data ordered by rank
    const cachedCryptos = await ctx.db
      .select()
      .from(MarketDataCache)
      .where(eq(MarketDataCache.assetType, "crypto"))
      .orderBy(MarketDataCache.rank)
      .limit(20);

    // Get the latest sync timestamp
    const latestSync = await ctx.db
      .select({ fetchedAt: MarketDataCache.fetchedAt })
      .from(MarketDataCache)
      .where(eq(MarketDataCache.assetType, "crypto"))
      .orderBy(desc(MarketDataCache.fetchedAt))
      .limit(1);

    const lastUpdated = latestSync[0]?.fetchedAt ?? new Date();

    // Transform cached data to match expected format
    return {
      cryptos: cachedCryptos.map((crypto) => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: parseFloat(crypto.price),
        change24h: parseFloat(crypto.change24h ?? "0"),
        changePercent24h: parseFloat(crypto.changePercent24h ?? "0"),
        volume24h: parseFloat(crypto.volume24h ?? "0"),
        marketCap: parseFloat(crypto.marketCap ?? "0"),
        rank: crypto.rank ?? 0,
        icon: CRYPTO_ICONS[crypto.symbol] ?? crypto.symbol.charAt(0),
      })),
      lastUpdated,
    };
  }),

  /**
   * Get aggregated market statistics from database cache
   */
  getMarketStats: publicProcedure.query(async ({ ctx }) => {
    // Get all cached cryptos for aggregation
    const cachedCryptos = await ctx.db
      .select()
      .from(MarketDataCache)
      .where(eq(MarketDataCache.assetType, "crypto"));

    if (cachedCryptos.length === 0) {
      // Return fallback values if cache is empty
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        btcDominance: 0,
        lastUpdated: new Date(),
        isStale: true,
      };
    }

    // Calculate aggregated stats
    let totalMarketCap = 0;
    let totalVolume24h = 0;
    let btcMarketCap = 0;
    let lastFetchedAt = new Date(0);

    for (const crypto of cachedCryptos) {
      const marketCap = parseFloat(crypto.marketCap ?? "0");
      const volume = parseFloat(crypto.volume24h ?? "0");

      totalMarketCap += marketCap;
      totalVolume24h += volume;

      if (crypto.symbol === "BTC/USD") {
        btcMarketCap = marketCap;
      }

      if (crypto.fetchedAt > lastFetchedAt) {
        lastFetchedAt = crypto.fetchedAt;
      }
    }

    const btcDominance =
      totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0;

    // Check if data is stale (more than 25 hours old)
    const staleThreshold = 25 * 60 * 60 * 1000; // 25 hours in ms
    const isStale = Date.now() - lastFetchedAt.getTime() > staleThreshold;

    return {
      totalMarketCap,
      totalVolume24h,
      btcDominance,
      lastUpdated: lastFetchedAt,
      isStale,
    };
  }),

  /**
   * Get the latest sync log status
   */
  getSyncStatus: publicProcedure.query(async ({ ctx }) => {
    const latestSync = await ctx.db
      .select()
      .from(MarketDataSyncLog)
      .orderBy(desc(MarketDataSyncLog.startedAt))
      .limit(1);

    return latestSync[0] ?? null;
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
