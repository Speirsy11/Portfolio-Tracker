import yahooFinance from "yahoo-finance2";

import { SearchResponseSchema } from "../schemas/finance";

export const yahooFinanceService = {
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
