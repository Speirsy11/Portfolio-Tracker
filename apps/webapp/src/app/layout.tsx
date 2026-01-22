import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ClerkProvider } from "@portfolio/auth";
import { cn } from "@portfolio/ui";
import { ThemeProvider } from "@portfolio/ui/theme";
import { Toaster } from "@portfolio/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://portfolio-tracker-webapp.vercel.app"
      : "http://localhost:3000",
  ),
  title: "Portfolio Tracker",
  description: "Simple portfolio tracking application",
  openGraph: {
    title: "Portfolio Tracker",
    description: "Simple portfolio tracking application",
    url: "https://portfolio-tracker-webapp.vercel.app",
    siteName: "Portfolio Tracker",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jannes_sut",
    creator: "@jannes_sut",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans text-foreground antialiased",
            geistSans.variable,
            geistMono.variable,
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>{props.children}</TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
