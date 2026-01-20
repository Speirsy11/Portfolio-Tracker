import { createOpenAI } from "@ai-sdk/openai";

/**
 * Supported LLM provider types for future extensibility
 * (e.g., Anthropic, Google)
 */
export type LLMProviderType = "openai" | "anthropic" | "google";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use gpt-4o-mini for cost efficiency per plan.md
export const defaultModel = openai("gpt-4o-mini");
