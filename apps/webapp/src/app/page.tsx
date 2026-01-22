import { FeaturesGrid } from "../components/home/features-grid";
import { HeroSection } from "../components/home/hero-section";
import { SocialProof } from "../components/home/social-proof";
import { MarketStats } from "../components/home/stat-cards";
import { CryptoList } from "../components/home/top-cryptos";
import { Footer } from "../components/layout/footer";
import { Header } from "../components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Market Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Market <span className="gradient-text">Overview</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Track real-time prices, market caps, and trading volumes across
              top cryptocurrencies.
            </p>
          </div>

          <MarketStats />

          <div className="mt-8">
            <CryptoList />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Footer */}
      <Footer />
    </div>
  );
}
