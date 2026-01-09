"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

// TODO: Make dynamic based on length of data available
const portfolioData = [
  { date: "Jan", value: 45000 },
  { date: "Feb", value: 52000 },
  { date: "Mar", value: 48000 },
  { date: "Apr", value: 61000 },
  { date: "May", value: 58000 },
  { date: "Jun", value: 67000 },
  { date: "Jul", value: 72000 },
  { date: "Aug", value: 69000 },
  { date: "Sep", value: 78000 },
  { date: "Oct", value: 85000 },
  { date: "Nov", value: 92000 },
  { date: "Dec", value: 98500 },
]

export function PortfolioChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Portfolio Performance</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">$98,500</div>
            <div className="text-sm text-success">+118.9% this year</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
                      <div className="text-sm font-medium">${payload[0].value?.toLocaleString()}</div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsla(125, 100%, 50%, 1.00)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "hsla(125, 100%, 50%, 1.00)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
