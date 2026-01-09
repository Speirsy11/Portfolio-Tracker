import { NewsSection } from "../components/home/news-section";
import { PortfolioChart } from "../components/home/portfolio-chart";
import { MarketStats } from "../components/home/stat-cards";
import { CryptoList } from "../components/home/top-cryptos";
import { Header } from "../components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Cryptocurrency Market Overview
          </h1>
          <p className="text-lg text-muted-foreground">
            Track real-time prices, market caps, and trading volumes
          </p>
        </div>

        <MarketStats />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CryptoList />
          </div>
          <div className="space-y-8">
            <PortfolioChart />
            <NewsSection />
          </div>
        </div>
      </main>
    </div>
  );
}
