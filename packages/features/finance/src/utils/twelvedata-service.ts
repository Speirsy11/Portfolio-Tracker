/**
 * Twelve Data API Service
 * Unified provider for stocks AND crypto data
 * Free tier: 800 credits/day (1 credit per symbol quote)
 *
 * @see https://twelvedata.com/docs
 */

const TWELVEDATA_BASE_URL = "https://api.twelvedata.com";

// Rate limiting: 8 requests per minute on free tier
const MIN_REQUEST_INTERVAL_MS = 8000; // 8 seconds between batches to be safe
let lastRequestTime = 0;

export interface TwelveDataSymbol {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  mic_code: string;
  country: string;
  type: string;
}

export interface TwelveDataCryptoSymbol {
  symbol: string;
  available_exchanges: string[];
  currency_base: string;
  currency_quote: string;
}

export interface TwelveDataQuote {
  symbol: string;
  name?: string;
  exchange?: string;
  mic_code?: string;
  currency?: string;
  datetime?: string;
  timestamp?: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  average_volume?: string;
  is_market_open?: boolean;
  fifty_two_week?: {
    low: string;
    high: string;
    low_change: string;
    high_change: string;
    low_change_percent: string;
    high_change_percent: string;
    range: string;
  };
}

export interface TwelveDataError {
  code: number;
  message: string;
  status: string;
}

// API response types
interface TwelveDataListResponse {
  data?: TwelveDataSymbol[];
  status?: string;
}

interface TwelveDataCryptoListResponse {
  data?: TwelveDataCryptoSymbol[];
  status?: string;
}

interface TwelveDataQuoteResponse {
  status?: string;
  symbol?: string;
  [key: string]: unknown;
}

// Normalized quote for our API - same shape for stocks and crypto
export interface NormalizedTwelveDataQuote {
  symbol: string;
  name: string;
  assetType: "crypto" | "stock";
  price: number;
  priceOpen: number;
  priceHigh: number;
  priceLow: number;
  pricePreviousClose: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number | null;
  exchange: string;
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest),
    );
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

function getApiKey(): string {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) {
    throw new Error("TWELVEDATA_API_KEY environment variable is not set");
  }
  return apiKey;
}

export const twelveDataService = {
  /**
   * Get list of available stocks
   * Uses 1 API credit
   */
  async getStocksList(): Promise<TwelveDataSymbol[]> {
    const apiKey = getApiKey();
    const url = `${TWELVEDATA_BASE_URL}/stocks?apikey=${apiKey}&country=United States`;

    const response = await rateLimitedFetch(url);
    const data = (await response.json()) as TwelveDataListResponse;

    if (data.status === "error") {
      console.error("Twelve Data stocks list error:", data);
      return [];
    }

    return data.data ?? [];
  },

  /**
   * Get list of available cryptocurrencies
   * Uses 1 API credit
   */
  async getCryptosList(): Promise<TwelveDataCryptoSymbol[]> {
    const apiKey = getApiKey();
    const url = `${TWELVEDATA_BASE_URL}/cryptocurrencies?apikey=${apiKey}`;

    const response = await rateLimitedFetch(url);
    const data = (await response.json()) as TwelveDataCryptoListResponse;

    if (data.status === "error") {
      console.error("Twelve Data cryptos list error:", data);
      return [];
    }

    return data.data ?? [];
  },

  /**
   * Get quote for a single symbol (works for both stocks and crypto)
   * Uses 1 API credit per symbol
   */
  async getQuote(
    symbol: string,
    assetType: "crypto" | "stock" = "stock",
  ): Promise<NormalizedTwelveDataQuote | null> {
    const quotes = await this.getQuotes([symbol], assetType);
    return quotes[0] ?? null;
  },

  /**
   * Batch quotes for multiple symbols (comma-separated)
   * Uses 1 API credit per symbol in batch
   * Max 8 symbols per batch on free tier
   */
  async getQuotes(
    symbols: string[],
    assetType: "crypto" | "stock" = "stock",
  ): Promise<NormalizedTwelveDataQuote[]> {
    if (symbols.length === 0) return [];

    const apiKey = getApiKey();
    const symbolsParam = symbols.join(",");
    const url = `${TWELVEDATA_BASE_URL}/quote?symbol=${symbolsParam}&apikey=${apiKey}`;

    try {
      const response = await rateLimitedFetch(url);
      const data = (await response.json()) as TwelveDataQuoteResponse;

      // Handle error response
      if (data.status === "error") {
        console.error("Twelve Data quote error:", data);
        return [];
      }

      // Single symbol returns object, multiple returns object with symbols as keys
      const quotes: NormalizedTwelveDataQuote[] = [];

      if (symbols.length === 1) {
        // Single symbol response
        if (data.symbol) {
          const normalized = normalizeQuote(
            data as unknown as TwelveDataQuote,
            assetType,
          );
          if (normalized) quotes.push(normalized);
        }
      } else {
        // Multiple symbols response
        for (const symbol of symbols) {
          const quoteData = data[symbol] as TwelveDataQuote | undefined;
          if (quoteData && !("code" in quoteData)) {
            const normalized = normalizeQuote(quoteData, assetType);
            if (normalized) quotes.push(normalized);
          }
        }
      }

      return quotes;
    } catch (error) {
      console.error("Twelve Data quotes fetch failed:", error);
      return [];
    }
  },

  /**
   * Fetch quotes in batches (respecting rate limits)
   * @param symbols Array of symbols to fetch
   * @param batchSize Number of symbols per batch (max 8 for free tier)
   */
  async getQuotesBatched(
    symbols: string[],
    assetType: "crypto" | "stock" = "stock",
    batchSize = 8,
  ): Promise<NormalizedTwelveDataQuote[]> {
    const allQuotes: NormalizedTwelveDataQuote[] = [];

    // Process in batches
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const quotes = await this.getQuotes(batch, assetType);
      allQuotes.push(...quotes);
    }

    return allQuotes;
  },
};

function normalizeQuote(
  quote: TwelveDataQuote,
  assetType: "crypto" | "stock",
): NormalizedTwelveDataQuote | null {
  if (!quote.close || !quote.symbol) {
    return null;
  }

  return {
    symbol: quote.symbol,
    name: quote.name ?? quote.symbol,
    assetType,
    price: parseFloat(quote.close) || 0,
    priceOpen: parseFloat(quote.open) || 0,
    priceHigh: parseFloat(quote.high) || 0,
    priceLow: parseFloat(quote.low) || 0,
    pricePreviousClose: parseFloat(quote.previous_close) || 0,
    change24h: parseFloat(quote.change) || 0,
    changePercent24h: parseFloat(quote.percent_change) || 0,
    volume24h: parseFloat(quote.volume) || 0,
    marketCap: null, // Twelve Data free tier doesn't include market cap in /quote
    exchange: quote.exchange ?? "",
  };
}
