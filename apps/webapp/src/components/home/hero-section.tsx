"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@portfolio/ui/button";

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden py-20 md:py-32">
      {/* Animated mesh overlay */}
      <div className="mesh-gradient absolute inset-0" />

      {/* Glow orbs */}
      <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
      <div className="bg-chart-3/20 absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-[120px]" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent ring-1 ring-accent/20">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Portfolio Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Track Your Crypto
            <span className="gradient-text block">With Confidence</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Monitor your portfolio performance, get AI-powered sentiment
            analysis, and make informed decisions with real-time market
            insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="glow group gap-2 rounded-full px-8 py-6 text-lg"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="glow group gap-2 rounded-full px-8 py-6 text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </SignedIn>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats preview */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "$2.4B", label: "Assets Tracked" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "AI Analysis" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-2xl font-bold md:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
