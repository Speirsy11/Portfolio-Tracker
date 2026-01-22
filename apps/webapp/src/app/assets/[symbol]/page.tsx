import { Suspense } from "react";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";

import { db } from "@portfolio/db/client";
import { Assets, SentimentLogs } from "@portfolio/db/schema";

import { AssetDetailContent } from "~/components/assets/asset-detail-content";
import { Header } from "~/components/layout/header";

interface AssetPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: AssetPageProps) {
  const { symbol } = await params;

  const asset = await db
    .select()
    .from(Assets)
    .where(eq(Assets.symbol, symbol.toUpperCase()))
    .limit(1);

  if (!asset[0]) {
    return {
      title: "Asset Not Found | Portfolio Tracker",
    };
  }

  return {
    title: `${asset[0].symbol} - ${asset[0].name} | Portfolio Tracker`,
    description: `View price charts and sentiment analysis for ${asset[0].name} (${asset[0].symbol})`,
  };
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { symbol } = await params;

  // Direct DB query using RSC
  const asset = await db
    .select()
    .from(Assets)
    .where(eq(Assets.symbol, symbol.toUpperCase()))
    .limit(1);

  if (!asset[0]) {
    notFound();
  }

  // Get latest sentiment
  const latestSentiment = await db
    .select()
    .from(SentimentLogs)
    .where(eq(SentimentLogs.assetId, asset[0].id))
    .orderBy(desc(SentimentLogs.createdAt))
    .limit(1);

  const assetWithSentiment = {
    ...asset[0],
    latestSentiment: latestSentiment[0] ?? null,
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <Suspense
          fallback={
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AssetDetailContent initialAsset={assetWithSentiment} />
        </Suspense>
      </main>
    </div>
  );
}
