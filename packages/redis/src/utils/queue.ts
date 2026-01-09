import { redis } from "./client";

const QUEUE_KEY = "narrative:queue";
const PROCESSING_SET_KEY = "narrative:processing";

export const ingestionQueue = {
  /**
   * Adds a ticker to the ingestion queue if it's not already being processed.
   * Uses Redis Set for deduplication.
   */
  async add(ticker: string) {
    const added = await redis.sadd(PROCESSING_SET_KEY, ticker);

    if (added === 0) {
      return { status: "skipped", reason: "already_queued" };
    }

    await redis.lpush(QUEUE_KEY, ticker);
    return { status: "queued", ticker };
  },

  /**
   * Remove ticker from processing set.
   * To be called by the worker after processing is done or failed.
   */
  async complete(ticker: string) {
    await redis.srem(PROCESSING_SET_KEY, ticker);
  },

  /**
   * Debugging/Monitoring helper
   */
  async getQueueLength() {
    return await redis.llen(QUEUE_KEY);
  },
};
