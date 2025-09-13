"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BuyStockModal } from "@/components/buy-stock-modal"
import { TrendingUp, TrendingDown, Search } from "lucide-react"

interface Stock {
  id: string
  symbol: string
  name: string
  current_price: number
  change_percent: number
  sector: string
  market_cap: number
}

interface StockListProps {
  userId: string
}

export function StockList({ userId }: StockListProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchStocks()
  }, [])

  useEffect(() => {
    const filtered = stocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStocks(filtered)
  }, [stocks, searchTerm])

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from("stocks").select("*").order("market_cap", { ascending: false })

      if (error) throw error
      setStocks(data || [])
      setFilteredStocks(data || [])
    } catch (error) {
      console.error("Error fetching stocks:", error)
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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `R${(marketCap / 1000000000000).toFixed(1)}T`
    } else if (marketCap >= 1000000000) {
      return `R${(marketCap / 1000000000).toFixed(1)}B`
    } else if (marketCap >= 1000000) {
      return `R${(marketCap / 1000000).toFixed(1)}M`
    }
    return `R${marketCap.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JSE Listed Stocks</CardTitle>
          <CardDescription>Browse and invest in top South African companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stocks by name, symbol, or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredStocks.map((stock) => (
              <Card key={stock.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                        <Badge variant="secondary">{stock.sector}</Badge>
                      </div>
                      <p className="text-gray-600 mb-1">{stock.name}</p>
                      <p className="text-sm text-gray-500">Market Cap: {formatMarketCap(stock.market_cap)}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold">{formatCurrency(stock.current_price)}</span>
                        <div
                          className={`flex items-center gap-1 ${
                            stock.change_percent >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.change_percent >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {stock.change_percent >= 0 ? "+" : ""}
                            {stock.change_percent}%
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => setSelectedStock(stock)} className="bg-emerald-600 hover:bg-emerald-700">
                        Buy Stock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedStock && (
        <BuyStockModal
          stock={selectedStock}
          userId={userId}
          isOpen={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          onSuccess={() => {
            setSelectedStock(null)
            // Refresh portfolio data if needed
          }}
        />
      )}
    </div>
  )
}
