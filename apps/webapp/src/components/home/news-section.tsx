import { ExternalLink, Newspaper } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card";

const newsArticles = [
  {
    title: "Bitcoin Reaches New All-Time High",
    source: "CryptoNews",
    time: "2 hours ago",
  },
  {
    title: "Ethereum 2.0 Upgrade Shows Promise",
    source: "BlockchainDaily",
    time: "5 hours ago",
  },
  {
    title: "Major Bank Announces Crypto Services",
    source: "FinanceToday",
    time: "8 hours ago",
  },
  {
    title: "DeFi Protocol Launches New Features",
    source: "DeFiInsider",
    time: "12 hours ago",
  },
];

export function NewsSection() {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Newspaper className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-xl">Latest Crypto News</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsArticles.map((article, index) => (
          <div
            key={index}
            className="group flex items-start justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="space-y-1">
              <h3 className="font-medium leading-tight group-hover:text-accent">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{article.source}</span>
                <span>•</span>
                <span>{article.time}</span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
