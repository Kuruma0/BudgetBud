"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react"

interface InvestmentInsightsProps {
  userId: string
}

export function InvestmentInsights({ userId }: InvestmentInsightsProps) {
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const portfolioKey = `portfolio_${userId}`

      // Get data from localStorage or use mock data
      const storedPortfolio = localStorage.getItem(portfolioKey)

      let portfolioData = []

      if (storedPortfolio) {
        portfolioData = JSON.parse(storedPortfolio)
      } else {
        // Mock portfolio data for demonstration
        portfolioData = [
          {
            id: 1,
            shares: 10,
            total_invested: 5000,
            stock: {
              symbol: "JSE:SHP",
              name: "Shoprite Holdings",
              current_price: 180.5,
              sector: "Consumer Staples",
            },
          },
          {
            id: 2,
            shares: 5,
            total_invested: 3000,
            stock: {
              symbol: "JSE:NPN",
              name: "Naspers",
              current_price: 3200.0,
              sector: "Technology",
            },
          },
        ]
        localStorage.setItem(portfolioKey, JSON.stringify(portfolioData))
      }

      setPortfolio(portfolioData)
    } catch (error) {
      console.error("Error fetching investment data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = () => {
    if (portfolio.length === 0) {
      return [
        {
          type: "tip",
          title: "Start Your Investment Journey",
          description:
            "Learning about diversified investments and understanding different asset classes can help build a strong foundation.",
          icon: Lightbulb,
        },
      ]
    }

    const insights = []

    // Portfolio diversification analysis
    const sectors = portfolio.reduce((acc: any, item) => {
      const sector = item.stock.sector
      acc[sector] = (acc[sector] || 0) + item.total_invested
      return acc
    }, {})

    const totalInvested = portfolio.reduce((sum, item) => sum + item.total_invested, 0)
    const sectorPercentages = Object.entries(sectors).map(([sector, amount]: [string, any]) => ({
      sector,
      percentage: (amount / totalInvested) * 100,
    }))

    // Check for over-concentration
    const overConcentrated = sectorPercentages.find((s) => s.percentage > 40)
    if (overConcentrated) {
      insights.push({
        type: "warning",
        title: "Portfolio Concentration Awareness",
        description: `${overConcentrated.percentage.toFixed(1)}% of your portfolio is in ${overConcentrated.sector}. Understanding diversification across sectors is an important investment concept.`,
        icon: AlertTriangle,
      })
    }

    // Performance analysis
    const currentValue = portfolio.reduce((sum, item) => sum + item.shares * item.stock.current_price, 0)
    const totalGainLoss = currentValue - totalInvested
    const totalGainLossPercent = (totalGainLoss / totalInvested) * 100

    if (totalGainLossPercent > 10) {
      insights.push({
        type: "success",
        title: "Portfolio Performance Update",
        description: `Your portfolio is up ${totalGainLossPercent.toFixed(1)}%. Understanding when to review and rebalance portfolios is a valuable skill.`,
        icon: TrendingUp,
      })
    } else if (totalGainLossPercent < -10) {
      insights.push({
        type: "warning",
        title: "Portfolio Performance Note",
        description: `Your portfolio is down ${Math.abs(totalGainLossPercent).toFixed(1)}%. Learning about market volatility and long-term investing strategies can be helpful.`,
        icon: TrendingDown,
      })
    }

    // General tips
    insights.push({
      type: "tip",
      title: "Investment Education",
      description:
        "Learning about regular investment plans and compound growth concepts can help you understand different investment strategies.",
      icon: Lightbulb,
    })

    return insights
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const insights = generateInsights()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Investment Insights</CardTitle>
          <CardDescription>Educational analysis and learning opportunities for your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <Card
                  key={index}
                  className={`border-l-4 ${
                    insight.type === "success"
                      ? "border-l-green-500"
                      : insight.type === "warning"
                        ? "border-l-yellow-500"
                        : "border-l-orange-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 mt-0.5 ${
                          insight.type === "success"
                            ? "text-green-600"
                            : insight.type === "warning"
                              ? "text-yellow-600"
                              : "text-orange-600"
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold mb-1">{insight.title}</h3>
                        <p className="text-gray-600 text-sm">{insight.description}</p>
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
