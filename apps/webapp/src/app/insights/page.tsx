import { redirect } from "next/navigation";

import { auth } from "@portfolio/auth";

import { InsightsContent } from "../../components/insights/insights-content";
import { Header } from "../../components/layout/header";

export default async function InsightsPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-lg text-muted-foreground">
            AI-powered market analysis and personalized recommendations
          </p>
        </div>

        <InsightsContent />
      </main>
    </div>
  );
}
