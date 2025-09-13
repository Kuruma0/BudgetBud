import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"

interface SpendingInsightsProps {
  userId: string
}

export async function SpendingInsights({ userId }: SpendingInsightsProps) {
  const supabase = await createClient()

  // Get recent spending advice
  const { data: recentAdvice } = await supabase
    .from("spending_advice")
    .select(`
      *,
      transactions (
        amount,
        category,
        merchant,
        transaction_date
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get spending patterns
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: monthlySpending } = await supabase
    .from("transactions")
    .select("amount, category")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("transaction_date", `${currentMonth}-01`)
    .lt("transaction_date", `${currentMonth}-32`)

  // Calculate category breakdown
  const categoryTotals =
    monthlySpending?.reduce(
      (acc, transaction) => {
        const category = transaction.category
        acc[category] = (acc[category] || 0) + Number(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const totalMonthlySpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const getAdviceIcon = (type: string) => {
    switch (type) {
      case "good_habit":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "bad_habit":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "suggestion":
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />
    }
  }

  const getAdviceColor = (type: string) => {
    switch (type) {
      case "good_habit":
        return "bg-green-50 border-green-200"
      case "bad_habit":
        return "bg-red-50 border-red-200"
      case "suggestion":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            <span>This Month's Spending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                R
                {totalMonthlySpending.toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-gray-600">Total spent this month</p>
            </div>

            {topCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Top Categories</h4>
                {topCategories.map(([category, amount]) => {
                  const percentage = (amount / totalMonthlySpending) * 100
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          R
                          {amount.toLocaleString("en-ZA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent AI Advice */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>AI Spending Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAdvice && recentAdvice.length > 0 ? (
            <div className="space-y-4">
              {recentAdvice.map((advice) => (
                <div key={advice.id} className={`p-4 rounded-lg border ${getAdviceColor(advice.advice_type)}`}>
                  <div className="flex items-start space-x-3">
                    {getAdviceIcon(advice.advice_type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          {advice.transactions?.merchant || advice.transactions?.category}
                        </p>
                        <span className="text-sm text-gray-500">
                          R
                          {Number(advice.transactions?.amount).toLocaleString("en-ZA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{advice.advice_text}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(advice.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
              <p className="text-gray-600">Add some transactions to get personalized spending advice from our AI</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
