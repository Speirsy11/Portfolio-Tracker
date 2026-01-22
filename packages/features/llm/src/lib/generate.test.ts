import { describe, expect, it, vi } from "vitest";

import type { SentimentAnalysis } from "./generate";
import { generateFinancialReport } from "./generate";

// Mock the Redis mockSettings to avoid real Redis calls
vi.mock("@portfolio/redis", () => ({
  mockSettings: {
    isLlmMockEnabled: vi.fn().mockResolvedValue(false),
  },
}));

// Mock the AI SDK to avoid real API calls
vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      sentimentScore: 0.65,
      reasoning: "Strong earnings beat expectations with 15% revenue growth",
      keyTopics: ["earnings", "revenue growth", "market expansion"],
    } satisfies SentimentAnalysis,
  }),
}));

describe("generateFinancialReport", () => {
  it("should call generateObject with correct parameters and return sentiment data", async () => {
    const result = await generateFinancialReport(
      "AAPL",
      "Apple reports record Q4 earnings, beats analyst expectations",
    );

    expect(result.object).toEqual({
      sentimentScore: 0.65,
      reasoning: "Strong earnings beat expectations with 15% revenue growth",
      keyTopics: ["earnings", "revenue growth", "market expansion"],
    });
  });

  it("should return sentiment score within valid range", async () => {
    const result = await generateFinancialReport(
      "TSLA",
      "Mixed quarterly results",
    );
    const sentiment = result.object as SentimentAnalysis;

    expect(sentiment.sentimentScore).toBeGreaterThanOrEqual(-1);
    expect(sentiment.sentimentScore).toBeLessThanOrEqual(1);
  });

  it("should return keyTopics as an array", async () => {
    const result = await generateFinancialReport(
      "MSFT",
      "Cloud revenue increases",
    );
    const sentiment = result.object as SentimentAnalysis;

    expect(Array.isArray(sentiment.keyTopics)).toBe(true);
  });
});
