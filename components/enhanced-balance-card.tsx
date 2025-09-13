"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, TrendingUp, TrendingDown, Target } from "lucide-react"

interface EnhancedBalanceCardProps {
  userId: string
  balance?: number
  monthlySpending?: number
}

export function EnhancedBalanceCard({ userId, balance = 0, monthlySpending = 0 }: EnhancedBalanceCardProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [budgetInput, setBudgetInput] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const savedBudget = localStorage.getItem(`budget_${userId}`)
    const budget = savedBudget ? Number(savedBudget) : 0
    setMonthlyBudget(budget)
    setBudgetInput(String(budget))
  }, [userId])

  const handleUpdateBudget = async () => {
    const newBudget = Number.parseFloat(budgetInput)
    if (isNaN(newBudget) || newBudget < 0) return

    localStorage.setItem(`budget_${userId}`, String(newBudget))
    setMonthlyBudget(newBudget)
    setDialogOpen(false)
  }

  const getBudgetStatus = () => {
    if (monthlyBudget === 0) return { color: "gray", status: "No budget set" }

    const spentPercentage = (monthlySpending / monthlyBudget) * 100

    if (spentPercentage <= 85) return { color: "green", status: "On track" }
    if (spentPercentage <= 100) return { color: "yellow", status: "Close to limit" }
    return { color: "red", status: "Over budget" }
  }

  const { color, status } = getBudgetStatus()
  const spentPercentage = monthlyBudget > 0 ? Math.min((monthlySpending / monthlyBudget) * 100, 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-orange-100">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-4xl font-bold">
              R{(balance || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-orange-100 text-sm">
              {(balance || 0) >= 0 ? "You're doing great!" : "Time to review your spending"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Budget Card */}
      <Card
        className={`border-2 shadow-lg ${
          color === "green"
            ? "bg-green-50 border-green-200"
            : color === "yellow"
              ? "bg-yellow-50 border-yellow-200"
              : color === "red"
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-200"
        }`}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">Monthly Budget</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Monthly Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Monthly Budget (ZAR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="Enter your monthly budget"
                  />
                </div>
                <Button onClick={handleUpdateBudget} className="w-full">
                  Update Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Spent</span>
              <span className="text-lg font-bold text-gray-900">
                R
                {(monthlySpending || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {monthlyBudget > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="text-sm text-gray-900">
                    R{monthlyBudget.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      color === "green" ? "bg-green-500" : color === "yellow" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${spentPercentage}%` }}
                  />
                </div>

                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    color === "green" ? "text-green-700" : color === "yellow" ? "text-yellow-700" : "text-red-700"
                  }`}
                >
                  {color === "green" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : color === "yellow" ? (
                    <Target className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {status}
                </div>
              </>
            )}

            {monthlyBudget === 0 && <p className="text-sm text-gray-500">Set a budget to track your progress</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
