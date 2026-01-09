import { generateObject } from "ai";
import { z } from 'zod/v4';

import { ANALYST_PROMPT } from "../data/prompts/analyst";
import { defaultModel } from "../providers/index";

export const generateFinancialReport = async (context: string) => {
  return generateObject({
    model: defaultModel,
    system: ANALYST_PROMPT,
    prompt: context,
    schema: z.object({
      summary: z
        .string()
        .describe("A concise executive summary of the current situation."),
      sentiment: z
        .enum(["positive", "negative", "neutral"])
        .describe("Overall market sentiment based on the data."),
      keyPoints: z
        .array(z.string())
        .describe("A bulleted list of critical factors influencing the asset."),
    }),
  });
};
