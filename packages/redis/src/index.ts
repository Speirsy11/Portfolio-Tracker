import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check for variables - though typically libraries handle this if not passed
// We will rely on process.env being set in the Next.js app or worker
// But for safety let's assume they are globally available or passed in.
// Upstash Redis client automatically picks up UPSTASH_REDIS_REST_URL and TOKEN if zero-config is used.
// But earlier we used `env.UPSTASH_REDIS_REST_URL`. 
// In a package, we can't easily use the app's typed env without importing it which creates a circular dep or tight coupling.
// So we use process.env directly or rely on the library's auto detection.
// If the user wants `redis = new Redis({ url: ... })` explicit, we might need to assume process.env.

// The Upstash Redis client automatically reads UPSTASH_REDIS_REST_URL/TOKEN from process.env if available.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "narrative:ratelimit",
});

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
  }
};
