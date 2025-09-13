"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Stock {
  id: string
  symbol: string
  name: string
  current_price: number
  change_percent: number
  sector: string
}

interface BuyStockModalProps {
  stock: Stock
  userId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BuyStockModal({ stock, userId, isOpen, onClose, onSuccess }: BuyStockModalProps) {
  const [shares, setShares] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const totalCost = Number.parseFloat(shares) * stock.current_price || 0
  const fees = totalCost * 0.005 // 0.5% transaction fee
  const totalWithFees = totalCost + fees

  const handleBuyStock = async () => {
    if (!shares || Number.parseFloat(shares) <= 0) {
      toast({
        title: "Invalid shares",
        description: "Please enter a valid number of shares",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create investment transaction
      const { error: transactionError } = await supabase.from("investment_transactions").insert({
        user_id: userId,
        stock_id: stock.id,
        transaction_type: "buy",
        shares: Number.parseFloat(shares),
        price_per_share: stock.current_price,
        total_amount: totalWithFees,
        fees: fees,
      })

      if (transactionError) throw transactionError

      // Update or create portfolio entry
      const { data: existingPortfolio } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .eq("stock_id", stock.id)
        .single()

      if (existingPortfolio) {
        // Update existing position
        const newShares = existingPortfolio.shares + Number.parseFloat(shares)
        const newTotalInvested = existingPortfolio.total_invested + totalWithFees
        const newAveragePrice = newTotalInvested / newShares

        const { error: updateError } = await supabase
          .from("portfolios")
          .update({
            shares: newShares,
            average_price: newAveragePrice,
            total_invested: newTotalInvested,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPortfolio.id)

        if (updateError) throw updateError
      } else {
        // Create new position
        const { error: insertError } = await supabase.from("portfolios").insert({
          user_id: userId,
          stock_id: stock.id,
          shares: Number.parseFloat(shares),
          average_price: stock.current_price,
          total_invested: totalWithFees,
        })

        if (insertError) throw insertError
      }

      toast({
        title: "Stock purchased successfully!",
        description: `You bought ${shares} shares of ${stock.symbol} for ${formatCurrency(totalWithFees)}`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error buying stock:", error)
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {stock.symbol}</DialogTitle>
          <DialogDescription>
            {stock.name} • {formatCurrency(stock.current_price)} per share
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              placeholder="Enter number of shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {shares && Number.parseFloat(shares) > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Shares:</span>
                <span>{Number.parseFloat(shares).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per share:</span>
                <span>{formatCurrency(stock.current_price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Transaction fee (0.5%):</span>
                <span>{formatCurrency(fees)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(totalWithFees)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleBuyStock}
              disabled={loading || !shares || Number.parseFloat(shares) <= 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Processing..." : "Buy Stock"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
