import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@portfolio/db";
import { Assets, SentimentLogs } from "@portfolio/db/schema";
import { yahooFinanceService } from "@portfolio/finance";
import { generateFinancialReport } from "@portfolio/llm";
import { ingestionQueue } from "@portfolio/redis";

import { env } from "~/env";

// Time budget for Vercel serverless function (50 seconds to leave buffer before 60s timeout)
const TIME_BUDGET_MS = 50_000;

/**
 * Processor Worker Cron Job
 * Processes queued assets with time-budgeting to respect serverless limits.
 * For each ticker: fetch news -> generate sentiment -> store in DB.
 */
export async function GET(request: Request) {
  // Verify CRON_SECRET for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  let processedCount = 0;
  let errorCount = 0;
  const errors: { ticker: string; error: string }[] = [];

  try {
    // Time-budgeting loop
    while (Date.now() - startTime < TIME_BUDGET_MS) {
      // Pop next ticker from queue
      const ticker = await ingestionQueue.pop();

      // Exit if queue is empty
      if (!ticker) {
        break;
      }

      try {
        // Fetch news via finance service
        const newsItems = await yahooFinanceService.searchAssets(ticker);

        // Format news context for LLM
        const newsContext = newsItems
          .map((item) => `${item.title}`)
          .join("\n- ");

        // Generate sentiment via LLM
        const sentimentResult = await generateFinancialReport(
          ticker,
          `Recent news for ${ticker}:\n- ${newsContext}`,
        );

        // Extract sentiment data with proper types
        const { sentimentScore, reasoning } = sentimentResult.object;

        // Find asset ID from database
        const asset = await db.query.Assets.findFirst({
          where: eq(Assets.symbol, ticker),
        });

        if (asset) {
          // Store result in SentimentLogs
          await db.insert(SentimentLogs).values({
            assetId: asset.id,
            score: sentimentScore.toFixed(2),
            summary: reasoning,
          });
        }

        // Mark ticker as complete
        await ingestionQueue.complete(ticker);
        processedCount++;
      } catch (tickerError) {
        // Log error but continue processing other tickers
        const errorMessage =
          tickerError instanceof Error
            ? tickerError.message
            : "Unknown error occurred";
        console.error(`Error processing ticker ${ticker}:`, errorMessage);
        errors.push({ ticker, error: errorMessage });
        errorCount++;

        // Still mark as complete to prevent retry loops
        await ingestionQueue.complete(ticker);
      }
    }

    const remainingQueue = await ingestionQueue.getQueueLength();

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors,
      remainingInQueue: remainingQueue,
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Worker cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
