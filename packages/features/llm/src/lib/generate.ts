import { generateObject } from "ai";
import { z } from "zod/v4";

import { createAnalystPrompt } from "../data/prompts/analyst";
import { defaultModel } from "../providers/llm-provider";

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
 * @param assetName - The name/ticker of the asset being analyzed
 * @param context - News headlines and summaries to analyze (limit to last 5)
 */
export const generateFinancialReport = async (
  assetName: string,
  context: string,
) => {
  return generateObject({
    model: defaultModel,
    system: createAnalystPrompt(assetName),
    prompt: context,
    schema: sentimentSchema,
  });
};
