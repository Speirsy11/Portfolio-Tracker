import { Shield, TrendingUp, Users, Zap } from "lucide-react";

import { Card, CardContent } from "@portfolio/ui/card";

const metrics = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Users",
    description: "Tracking their crypto portfolios",
  },
  {
    icon: TrendingUp,
    value: "$2.4B",
    label: "Assets Tracked",
    description: "Across all user portfolios",
  },
  {
    icon: Zap,
    value: "1M+",
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

export function SocialProof() {
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
          {metrics.map((metric) => {
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
          })}
        </div>
      </div>
    </section>
  );
}
