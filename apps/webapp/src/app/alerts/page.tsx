import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { auth } from "@portfolio/auth";
import { db } from "@portfolio/db/client";
import { Assets, PriceAlerts } from "@portfolio/db/schema";

import { AlertsContent } from "../../components/alerts/alerts-content";
import { Header } from "../../components/layout/header";

export default async function AlertsPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/");
  }

  // Direct DB query using RSC
  const alerts = await db
    .select({
      id: PriceAlerts.id,
      assetId: PriceAlerts.assetId,
      targetPrice: PriceAlerts.targetPrice,
      condition: PriceAlerts.condition,
      isActive: PriceAlerts.isActive,
      triggeredAt: PriceAlerts.triggeredAt,
      createdAt: PriceAlerts.createdAt,
      asset: {
        id: Assets.id,
        symbol: Assets.symbol,
        name: Assets.name,
      },
    })
    .from(PriceAlerts)
    .innerJoin(Assets, eq(PriceAlerts.assetId, Assets.id))
    .where(eq(PriceAlerts.userId, session.userId))
    .orderBy(desc(PriceAlerts.createdAt));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Price Alerts</h1>
          <p className="text-lg text-muted-foreground">
            Set price targets and get notified when assets hit your thresholds
          </p>
        </div>

        <AlertsContent initialAlerts={alerts} />
      </main>
    </div>
  );
}
