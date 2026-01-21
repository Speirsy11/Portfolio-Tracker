import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { auth } from "@portfolio/auth";
import { db } from "@portfolio/db/client";
import { Portfolios } from "@portfolio/db/schema";

import { DashboardContent } from "../../components/dashboard/dashboard-content";
import { Header } from "../../components/layout/header";

export default async function DashboardPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/");
  }

  // Direct DB query using RSC (no API call needed)
  const portfolios = await db
    .select()
    .from(Portfolios)
    .where(eq(Portfolios.userId, session.userId))
    .orderBy(desc(Portfolios.createdAt));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Portfolio Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your assets and monitor AI-powered sentiment analysis
          </p>
        </div>

        <DashboardContent initialPortfolios={portfolios} />
      </main>
    </div>
  );
}
