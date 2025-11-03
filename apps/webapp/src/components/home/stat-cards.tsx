import { Card, CardContent } from "@exchange/ui/card"
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"

const stats = [
  {
    label: "Total Market Cap",
    value: "$2.45T",
    change: "+2.34%",
    isPositive: true,
    icon: DollarSign,
  },
  {
    label: "24h Trading Volume",
    value: "$98.7B",
    change: "-1.23%",
    isPositive: false,
    icon: Activity,
  },
  {
    label: "Fear & Greed Index",
    value: "72",
    change: "Greed",
    isPositive: true,
    icon: TrendingUp,
  },
  {
    label: "BTC Dominance",
    value: "48.2%",
    change: "+0.5%",
    isPositive: true,
    icon: TrendingUp,
  },
]

export function MarketStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${stat.isPositive ? "text-success" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
