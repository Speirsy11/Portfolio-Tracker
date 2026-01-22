import { generateObject } from "ai";
import { z } from "zod/v4";

import { mockSettings } from "@portfolio/redis";

import { createAnalystPrompt } from "../data/prompts/analyst";
import { defaultModel } from "../providers/llm-provider";
import { generateMockResponse } from "./mock-responses";

/**
 * Schema for AI-generated sentiment analysis per plan.md specification
 */
export const sentimentSchema = z.object({
  sentimentScore: z
    .number()
    .min(-1)
    .max(1)
    .describe("Sentiment score from -1 (Bearish) to 1 (Bullish)"),
  reasoning: z.string().describe("Why this sentiment?"),
  keyTopics: z.array(z.string()).describe("Key topics extracted from the news"),
});

export type SentimentAnalysis = z.infer<typeof sentimentSchema>;

/**
 * Generate a financial sentiment analysis for the given asset and news context
 * Supports mocking when enabled via admin settings
 * @param assetName - The name/ticker of the asset being analyzed
 * @param context - News headlines and summaries to analyze (limit to last 5)
 */
export const generateFinancialReport = async (
  assetName: string,
  context: string,
) => {
  // Check if mocking is enabled
  const isMockEnabled = await mockSettings.isLlmMockEnabled();

  if (isMockEnabled) {
    // Return mock response in the same format as generateObject
    const mockResponse = generateMockResponse(assetName);
    return { object: mockResponse };
  }

  return generateObject({
    model: defaultModel,
    system: createAnalystPrompt(assetName),
    prompt: context,
    schema: sentimentSchema,
  });
};
