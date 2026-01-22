import Link from "next/link";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import { Card, CardContent } from "@portfolio/ui/card";

import { Header } from "../../components/layout/header";

export default function WipPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-6 p-12 text-center">
            <div className="relative">
              <div className="to-chart-3/20 absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 blur-xl" />
              <div className="to-chart-3/10 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 ring-1 ring-border">
                <Construction className="h-10 w-10 text-accent" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Coming Soon</h1>
              <p className="text-muted-foreground">
                We&apos;re building something amazing! This feature is currently
                under development and will be available soon.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent">
              <Sparkles className="h-4 w-4" />
              <span>Stay tuned for updates</span>
            </div>

            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
