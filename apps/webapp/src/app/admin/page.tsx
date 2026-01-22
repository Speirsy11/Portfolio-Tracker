import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@portfolio/auth";
import { db } from "@portfolio/db/client";
import { Users } from "@portfolio/db/schema";

import { MockSettings } from "../../components/admin/mock-settings";
import { Header } from "../../components/layout/header";

export default async function AdminPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/");
  }

  // Check if user is admin
  const user = await db
    .select({ isAdmin: Users.isAdmin })
    .from(Users)
    .where(eq(Users.id, session.userId))
    .limit(1);

  if (!user[0]?.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-lg text-muted-foreground">
            Configure system-wide settings and feature flags.
          </p>
        </div>

        <MockSettings />
      </main>
    </div>
  );
}
