import Link from "next/link";
import { Settings, TrendingUp } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">CryptoExchange</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/markets"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Markets
          </Link>
          <Link
            href="/strategies"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Strategies
          </Link>
          <Link
            href="/portfolio"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Portfolio
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted md:inline-flex">
            Sign In / Sign Up
          </button>
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
