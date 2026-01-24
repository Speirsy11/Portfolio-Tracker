"use client";

import { Shield, TrendingUp, Users, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@portfolio/ui/card";
import { Skeleton } from "@portfolio/ui/skeleton";

import { useTRPC } from "~/trpc/react";

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
  if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
  if (count === 0) return "0";
  return count.toLocaleString();
}

function MetricCardSkeleton() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 text-center">
        <Skeleton className="mx-auto mb-4 h-14 w-14 rounded-2xl" />
        <Skeleton className="mx-auto mb-1 h-8 w-20" />
        <Skeleton className="mx-auto mb-2 h-5 w-24" />
        <Skeleton className="mx-auto h-4 w-32" />
      </CardContent>
    </Card>
  );
}

export function SocialProof() {
  const trpc = useTRPC();

  const { data: platformStats, isLoading } = useQuery({
    ...trpc.market.getPlatformStats.queryOptions(),
    staleTime: 60000, // Cache for 1 minute
  });

  const metrics = [
    {
      icon: Users,
      value: isLoading ? null : formatCount(platformStats?.userCount ?? 0),
      label: "Active Users",
      description: "Tracking their crypto portfolios",
    },
    {
      icon: TrendingUp,
      value: isLoading ? null : formatCount(platformStats?.assetsTracked ?? 0),
      label: "Assets Tracked",
      description: "Across all user portfolios",
    },
    {
      icon: Zap,
      value: isLoading ? null : formatCount(platformStats?.sentimentCount ?? 0),
      label: "AI Analyses",
      description: "Sentiment insights generated",
    },
    {
      icon: Shield,
      value: "99.9%",
      label: "Uptime",
      description: "Reliable 24/7 monitoring",
    },
  ];

  return (
    <section className="border-y border-border bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Trusted by Thousands of
            <span className="gradient-text"> Investors</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join a growing community of crypto enthusiasts who trust Portfolio
            Tracker for their investment decisions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={metric.label}
                  className="border-border bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <div className="mb-1 text-3xl font-bold">{metric.value}</div>
                    <div className="mb-2 font-medium">{metric.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
