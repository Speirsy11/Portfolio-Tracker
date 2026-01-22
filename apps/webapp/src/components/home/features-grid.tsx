import Link from "next/link";
import { ArrowRight, Bell, Brain, LineChart, List } from "lucide-react";

import { Card, CardContent } from "@portfolio/ui/card";

const features = [
  {
    icon: LineChart,
    title: "Portfolio Tracking",
    description:
      "Monitor your cryptocurrency holdings in real-time with beautiful charts and detailed analytics.",
    href: "/dashboard",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description:
      "Get AI-powered sentiment analysis and market predictions to make informed investment decisions.",
    href: "/wip",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description:
      "Set custom price alerts and get notified instantly when your assets hit target prices.",
    href: "/wip",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    icon: List,
    title: "Watchlists",
    description:
      "Create custom watchlists to monitor potential investments without adding them to your portfolio.",
    href: "/wip",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to
            <span className="gradient-text"> Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools designed to help you track, analyze, and optimize
            your cryptocurrency portfolio.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="hover-lift group h-full cursor-pointer border-border bg-card/50 backdrop-blur-sm transition-colors hover:border-accent/50">
                  <CardContent className="flex h-full flex-col p-6">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mb-4 flex-grow text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
