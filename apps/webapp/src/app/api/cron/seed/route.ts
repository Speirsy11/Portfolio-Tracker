import { NextResponse } from "next/server";

import { db } from "@portfolio/db";
import { Assets } from "@portfolio/db/schema";
import { ingestionQueue } from "@portfolio/redis";

import { env } from "~/env";

/**
 * Seeder Cron Job
 * Populates the ingestion queue with all tracked assets.
 * Should be called periodically (e.g., every hour) to ensure all assets are queued for sentiment analysis.
 */
export async function GET(request: Request) {
  // Verify CRON_SECRET for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Query all assets from database
    const assets = await db.select().from(Assets);

    // Add each asset ticker to the ingestion queue
    let queuedCount = 0;
    let skippedCount = 0;

    for (const asset of assets) {
      const result = await ingestionQueue.add(asset.symbol);
      if (result.status === "queued") {
        queuedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalAssets: assets.length,
      queued: queuedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Seeder cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
