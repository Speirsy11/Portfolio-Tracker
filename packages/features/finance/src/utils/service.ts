import yahooFinance from "yahoo-finance2";

import { SearchResponseSchema } from "../schemas/finance";

// Simple in-memory cache for ticker search results
const searchCache = new Map<string, { results: TickerSearchResult[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

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
      if (error instanceof Error && error.message.includes("Too Many Requests")) {
        console.warn(`Yahoo Finance rate limited for query: ${query}`);
        // Return cached results if available (even if stale)
        if (cached) {
          return cached.results;
        }
      } else {
        console.error(`Yahoo Finance Ticker Search Failed for ${query}:`, error);
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
};
