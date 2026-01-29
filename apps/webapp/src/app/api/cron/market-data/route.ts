import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@portfolio/db";
import { MarketDataCache, MarketDataSyncLog } from "@portfolio/db/schema";
import { twelveDataService } from "@portfolio/finance";

import { env } from "~/env";

// Top crypto symbols to fetch (Twelve Data format: BASE/QUOTE)
const TOP_CRYPTO_SYMBOLS = [
  "BTC/USD",
  "ETH/USD",
  "USDT/USD",
  "BNB/USD",
  "SOL/USD",
  "XRP/USD",
  "USDC/USD",
  "ADA/USD",
  "AVAX/USD",
  "DOGE/USD",
  "DOT/USD",
  "TRX/USD",
  "LINK/USD",
  "MATIC/USD",
  "SHIB/USD",
  "LTC/USD",
  "BCH/USD",
  "ATOM/USD",
  "UNI/USD",
  "XLM/USD",
];

// Crypto name mapping (Twelve Data doesn't always return full names)
const CRYPTO_NAMES: Record<string, string> = {
  "BTC/USD": "Bitcoin",
  "ETH/USD": "Ethereum",
  "USDT/USD": "Tether",
  "BNB/USD": "BNB",
  "SOL/USD": "Solana",
  "XRP/USD": "XRP",
  "USDC/USD": "USD Coin",
  "ADA/USD": "Cardano",
  "AVAX/USD": "Avalanche",
  "DOGE/USD": "Dogecoin",
  "DOT/USD": "Polkadot",
  "TRX/USD": "TRON",
  "LINK/USD": "Chainlink",
  "MATIC/USD": "Polygon",
  "SHIB/USD": "Shiba Inu",
  "LTC/USD": "Litecoin",
  "BCH/USD": "Bitcoin Cash",
  "ATOM/USD": "Cosmos",
  "UNI/USD": "Uniswap",
  "XLM/USD": "Stellar",
};

// Top stock symbols to fetch
const TOP_STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "BRK.B",
  "UNH",
  "LLY",
  "JPM",
  "V",
  "XOM",
  "AVGO",
  "MA",
  "JNJ",
  "PG",
  "HD",
  "COST",
  "MRK",
];

/**
 * Market Data Sync Cron Job
 * Fetches top cryptos and stocks from Twelve Data and caches in database.
 * Schedule: 0 2 * * * (2am UTC daily)
 */
export async function GET(request: Request) {
  // Verify CRON_SECRET for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  let syncLogId: string | undefined;
  let apiRequestsUsed = 0;
  let recordsProcessed = 0;

  try {
    // Create sync log entry
    const [syncLog] = await db
      .insert(MarketDataSyncLog)
      .values({
        syncType: "all",
        status: "running",
      })
      .returning({ id: MarketDataSyncLog.id });

    syncLogId = syncLog?.id;

    // Fetch crypto quotes
    console.log("Fetching crypto quotes...");
    const cryptoQuotes = await twelveDataService.getQuotesBatched(
      TOP_CRYPTO_SYMBOLS,
      "crypto",
      8, // Batch size for free tier
    );
    apiRequestsUsed += Math.ceil(TOP_CRYPTO_SYMBOLS.length / 8);

    // Upsert crypto data
    for (let i = 0; i < cryptoQuotes.length; i++) {
      const quote = cryptoQuotes[i];
      if (!quote) continue;

      const existingRecord = await db.query.MarketDataCache.findFirst({
        where: eq(MarketDataCache.symbol, quote.symbol),
      });

      const dataToUpsert = {
        symbol: quote.symbol,
        name: CRYPTO_NAMES[quote.symbol] ?? quote.name,
        assetType: "crypto" as const,
        price: quote.price.toString(),
        priceOpen: quote.priceOpen.toString(),
        priceHigh: quote.priceHigh.toString(),
        priceLow: quote.priceLow.toString(),
        pricePreviousClose: quote.pricePreviousClose.toString(),
        change24h: quote.change24h.toString(),
        changePercent24h: quote.changePercent24h.toString(),
        volume24h: quote.volume24h.toString(),
        marketCap: quote.marketCap?.toString() ?? null,
        rank: i + 1,
        fetchedAt: new Date(),
      };

      if (existingRecord) {
        await db
          .update(MarketDataCache)
          .set(dataToUpsert)
          .where(eq(MarketDataCache.id, existingRecord.id));
      } else {
        await db.insert(MarketDataCache).values(dataToUpsert);
      }
      recordsProcessed++;
    }

    // Fetch stock quotes
    console.log("Fetching stock quotes...");
    const stockQuotes = await twelveDataService.getQuotesBatched(
      TOP_STOCK_SYMBOLS,
      "stock",
      8,
    );
    apiRequestsUsed += Math.ceil(TOP_STOCK_SYMBOLS.length / 8);

    // Upsert stock data
    for (let i = 0; i < stockQuotes.length; i++) {
      const quote = stockQuotes[i];
      if (!quote) continue;

      const existingRecord = await db.query.MarketDataCache.findFirst({
        where: eq(MarketDataCache.symbol, quote.symbol),
      });

      const dataToUpsert = {
        symbol: quote.symbol,
        name: quote.name,
        assetType: "stock" as const,
        price: quote.price.toString(),
        priceOpen: quote.priceOpen.toString(),
        priceHigh: quote.priceHigh.toString(),
        priceLow: quote.priceLow.toString(),
        pricePreviousClose: quote.pricePreviousClose.toString(),
        change24h: quote.change24h.toString(),
        changePercent24h: quote.changePercent24h.toString(),
        volume24h: quote.volume24h.toString(),
        marketCap: quote.marketCap?.toString() ?? null,
        rank: i + 1,
        fetchedAt: new Date(),
      };

      if (existingRecord) {
        await db
          .update(MarketDataCache)
          .set(dataToUpsert)
          .where(eq(MarketDataCache.id, existingRecord.id));
      } else {
        await db.insert(MarketDataCache).values(dataToUpsert);
      }
      recordsProcessed++;
    }

    // Update sync log with success
    if (syncLogId) {
      await db
        .update(MarketDataSyncLog)
        .set({
          status: "completed",
          recordsProcessed,
          apiRequestsUsed,
          completedAt: new Date(),
        })
        .where(eq(MarketDataSyncLog.id, syncLogId));
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      recordsProcessed,
      apiRequestsUsed,
      executionTimeMs,
      cryptoCount: cryptoQuotes.length,
      stockCount: stockQuotes.length,
    });
  } catch (error) {
    console.error("Market data sync failed:", error);

    // Update sync log with failure
    if (syncLogId) {
      await db
        .update(MarketDataSyncLog)
        .set({
          status: "failed",
          recordsProcessed,
          apiRequestsUsed,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        })
        .where(eq(MarketDataSyncLog.id, syncLogId));
    }

    return NextResponse.json(
      {
        error: "Market data sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
