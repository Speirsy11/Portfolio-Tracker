import yahooFinance from "yahoo-finance2";
import { z } from "zod";

const NewsItemSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  link: z.string(),
  providerPublishTime: z.number().or(z.date()).optional(), // library might return date or number
  thumbnail: z.object({
    resolutions: z.array(z.object({
      url: z.string()
    })).optional()
  }).optional().nullish(), // Sometimes available
  publisher: z.string().optional(),
}).passthrough();

const SearchResponseSchema = z.object({
  news: z.array(NewsItemSchema),
});

export const yahooFinanceService = {
  async searchAssets(ticker: string) {
    try {
      // newsCount option requires looking at docs, but typical use is search(query, opts)
      const result = await yahooFinance.search(ticker, { newsCount: 5 });
      
      // Basic validation wrapper
      const parsed = SearchResponseSchema.safeParse(result);
      
      if (!parsed.success) {
        console.error("Yahoo Finance Validation Error:", parsed.error);
        throw new Error("Invalid response structure from Yahoo Finance");
      }

      return parsed.data.news.map(item => ({
        uuid: item.uuid,
        title: item.title,
        link: item.link,
        publishedAt: item.providerPublishTime,
      }));

    } catch (error) {
      // Enhance error for the worker
      if (error instanceof Error) {
        throw new Error(`Yahoo Finance Search Failed for ${ticker}: ${error.message}`);
      }
      throw error;
    }
  },
};
