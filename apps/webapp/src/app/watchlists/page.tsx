import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { auth } from "@portfolio/auth";
import { db } from "@portfolio/db/client";
import { Watchlists } from "@portfolio/db/schema";

import { Header } from "../../components/layout/header";
import { WatchlistsContent } from "../../components/watchlists/watchlists-content";

export default async function WatchlistsPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/");
  }

  // Direct DB query using RSC
  const watchlists = await db
    .select()
    .from(Watchlists)
    .where(eq(Watchlists.userId, session.userId))
    .orderBy(desc(Watchlists.createdAt));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Watchlists</h1>
          <p className="text-lg text-muted-foreground">
            Track your favorite assets and monitor their performance
          </p>
        </div>

        <WatchlistsContent initialWatchlists={watchlists} />
      </main>
    </div>
  );
}
