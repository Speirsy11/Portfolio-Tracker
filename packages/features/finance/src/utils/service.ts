import yahooFinance from "yahoo-finance2";

import type { MarketStats, NormalizedQuote } from "../schemas/quote";
import { SearchResponseSchema } from "../schemas/finance";

// Simple in-memory cache for ticker search results
const searchCache = new Map<
  string,
  { results: TickerSearchResult[]; timestamp: number }
>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Cache for quotes (shorter TTL for fresher data)
const quotesCache = new Map<
  string,
  { quotes: NormalizedQuote[]; timestamp: number }
>();
const QUOTES_CACHE_TTL_MS = 30 * 1000; // 30 seconds cache

// Valid quote types for ticker search
const VALID_QUOTE_TYPES = [
  "EQUITY",
  "ETF",
  "MUTUALFUND",
  "CRYPTOCURRENCY",
  "CURRENCY",
  "INDEX",
  "FUTURE",
];

// Top cryptocurrencies for market overview
const TOP_CRYPTO_SYMBOLS = [
  "BTC-USD",
  "ETH-USD",
  "USDT-USD",
  "BNB-USD",
  "SOL-USD",
];

export interface TickerSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export const yahooFinanceService = {
  async searchTickers(query: string): Promise<TickerSearchResult[]> {
    const cacheKey = query.toLowerCase().trim();

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }

    try {
      const result = await yahooFinance.search(query, { quotesCount: 10 });

      const results: TickerSearchResult[] = [];

      for (const quote of result.quotes) {
        // Type guard: check if this is a valid Yahoo Finance quote with symbol and quoteType
        if (!("symbol" in quote) || !("quoteType" in quote)) {
          continue;
        }

        const q = quote as {
          symbol: string;
          quoteType: string;
          shortname?: string;
          longname?: string;
          exchange?: string;
        };

        if (!VALID_QUOTE_TYPES.includes(q.quoteType)) {
          continue;
        }

        results.push({
          symbol: q.symbol,
          name: q.shortname ?? q.longname ?? q.symbol,
          type: q.quoteType,
          exchange: q.exchange ?? "",
        });
      }

      // Cache the results
      searchCache.set(cacheKey, { results, timestamp: Date.now() });

      return results;
    } catch (error) {
      // Check for rate limiting
      if (
        error instanceof Error &&
        error.message.includes("Too Many Requests")
      ) {
        console.warn(`Yahoo Finance rate limited for query: ${query}`);
        // Return cached results if available (even if stale)
        if (cached) {
          return cached.results;
        }
      } else {
        console.error(
          `Yahoo Finance Ticker Search Failed for ${query}:`,
          error,
        );
      }
      return [];
    }
  },

  async searchAssets(ticker: string) {
    try {
      const result = await yahooFinance.search(ticker, { newsCount: 5 });

      const parsed = SearchResponseSchema.safeParse(result);

      if (!parsed.success) {
        console.error("Yahoo Finance Validation Error:", parsed.error);
        throw new Error("Invalid response structure from Yahoo Finance");
      }

      return parsed.data.news.map((item) => ({
        uuid: item.uuid,
        title: item.title,
        link: item.link,
        publishedAt: item.providerPublishTime,
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Yahoo Finance Search Failed for ${ticker}: ${error.message}`,
        );
      }
      throw error;
    }
  },

  /**
   * Fetch quotes for multiple symbols
   * Returns normalized quote data for each symbol
   */
  async getQuotes(symbols: string[]): Promise<NormalizedQuote[]> {
    const cacheKey = symbols.sort().join(",");

    // Check cache first
    const cached = quotesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < QUOTES_CACHE_TTL_MS) {
      return cached.quotes;
    }

    try {
      const results = await yahooFinance.quote(symbols);

      // Handle both single and array responses
      const quotesArray = Array.isArray(results) ? results : [results];

      const normalizedQuotes: NormalizedQuote[] = quotesArray
        .filter((q) => q && q.regularMarketPrice !== undefined)
        .map((q) => ({
          symbol: q.symbol,
          name: q.shortName ?? q.longName ?? q.symbol,
          price: q.regularMarketPrice ?? 0,
          change24h: q.regularMarketChange ?? 0,
          changePercent24h: q.regularMarketChangePercent ?? 0,
          volume24h: q.regularMarketVolume ?? 0,
          marketCap: q.marketCap ?? 0,
        }));

      // Cache the results
      quotesCache.set(cacheKey, {
        quotes: normalizedQuotes,
        timestamp: Date.now(),
      });

      return normalizedQuotes;
    } catch (error) {
      console.error(`Yahoo Finance Quote Failed for ${symbols.join(", ")}:`, error);

      // Return cached results if available (even if stale)
      if (cached) {
        return cached.quotes;
      }

      return [];
    }
  },

  /**
   * Fetch top cryptocurrencies for the homepage
   */
  async getTopCryptos(): Promise<NormalizedQuote[]> {
    return this.getQuotes(TOP_CRYPTO_SYMBOLS);
  },

  /**
   * Calculate market statistics from top cryptos
   */
  async getMarketStats(): Promise<MarketStats | null> {
    try {
      const quotes = await this.getTopCryptos();

      if (quotes.length === 0) {
        return null;
      }

      const totalMarketCap = quotes.reduce((sum, q) => sum + q.marketCap, 0);
      const totalVolume24h = quotes.reduce((sum, q) => sum + q.volume24h, 0);

      // Find BTC for dominance calculation
      const btcQuote = quotes.find((q) => q.symbol === "BTC-USD");
      const btcDominance = btcQuote
        ? (btcQuote.marketCap / totalMarketCap) * 100
        : 0;

      return {
        totalMarketCap,
        totalVolume24h,
        btcDominance,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Failed to calculate market stats:", error);
      return null;
    }
  },
};

