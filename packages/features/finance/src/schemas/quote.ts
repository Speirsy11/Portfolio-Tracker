import { z } from "zod/v4";

// Schema for cryptocurrency quote from Yahoo Finance
export const CryptoQuoteSchema = z.object({
  symbol: z.string(),
  shortName: z.string().optional(),
  longName: z.string().optional(),
  regularMarketPrice: z.number(),
  regularMarketChange: z.number().optional(),
  regularMarketChangePercent: z.number().optional(),
  regularMarketVolume: z.number().optional(),
  marketCap: z.number().optional(),
  // For ranking purposes
  circulatingSupply: z.number().optional(),
});

export type CryptoQuote = z.infer<typeof CryptoQuoteSchema>;

// Normalized quote for our API responses
export const NormalizedQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change24h: z.number(),
  changePercent24h: z.number(),
  volume24h: z.number(),
  marketCap: z.number(),
});

export type NormalizedQuote = z.infer<typeof NormalizedQuoteSchema>;

// Market stats aggregation
export const MarketStatsSchema = z.object({
  totalMarketCap: z.number(),
  totalVolume24h: z.number(),
  btcDominance: z.number(),
  lastUpdated: z.date(),
});

export type MarketStats = z.infer<typeof MarketStatsSchema>;
