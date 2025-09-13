"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react"

interface PortfolioItem {
  id: string
  shares: number
  average_price: number
  total_invested: number
  stock: {
    id: string
    symbol: string
    name: string
    current_price: number
    change_percent: number
    sector: string
  }
}

interface PortfolioProps {
  userId: string
}

export function Portfolio({ userId }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchPortfolio()
  }, [userId])

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select(`
          *,
          stock:stocks(*)
        `)
        .eq("user_id", userId)

      if (error) throw error
      setPortfolio(data || [])
    } catch (error) {
      console.error("Error fetching portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const calculatePortfolioStats = () => {
    const totalInvested = portfolio.reduce((sum, item) => sum + item.total_invested, 0)
    const currentValue = portfolio.reduce((sum, item) => sum + item.shares * item.stock.current_price, 0)
    const totalGainLoss = currentValue - totalInvested
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

    return {
      totalInvested,
      currentValue,
      totalGainLoss,
      totalGainLossPercent,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <PieChart className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
          <p className="text-gray-600 text-center mb-4">
            Start building your portfolio by browsing and purchasing stocks
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Stocks</Button>
        </CardContent>
      </Card>
    )
  }

  const stats = calculatePortfolioStats()

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {stats.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.totalGainLoss >= 0 ? "+" : ""}
              {formatCurrency(stats.totalGainLoss)}
            </div>
            <p className={`text-xs ${stats.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.totalGainLossPercent >= 0 ? "+" : ""}
              {stats.totalGainLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
          <CardDescription>Current positions in your investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.map((item) => {
              const currentValue = item.shares * item.stock.current_price
              const gainLoss = currentValue - item.total_invested
              const gainLossPercent = (gainLoss / item.total_invested) * 100

              return (
                <Card key={item.id} className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{item.stock.symbol}</h3>
                          <Badge variant="secondary">{item.stock.sector}</Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{item.stock.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{item.shares.toFixed(2)} shares</span>
                          <span>Avg: {formatCurrency(item.average_price)}</span>
                          <span>Current: {formatCurrency(item.stock.current_price)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold mb-1">{formatCurrency(currentValue)}</div>
                        <div
                          className={`flex items-center gap-1 justify-end ${
                            gainLoss >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {gainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="font-medium">
                            {gainLoss >= 0 ? "+" : ""}
                            {formatCurrency(gainLoss)}
                          </span>
                          <span className="text-sm">
                            ({gainLossPercent >= 0 ? "+" : ""}
                            {gainLossPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
