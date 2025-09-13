import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TransactionsListProps {
  userId: string
}

export async function TransactionsList({ userId }: TransactionsListProps) {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      spending_advice (
        advice_text,
        advice_type
      )
    `)
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .limit(10)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Food & Dining": "🍽️",
      Transportation: "🚗",
      Shopping: "🛍️",
      Entertainment: "🎬",
      "Bills & Utilities": "⚡",
      Healthcare: "🏥",
      Education: "📚",
      Travel: "✈️",
      Groceries: "🛒",
      Gas: "⛽",
      Coffee: "☕",
      Subscriptions: "📱",
      Salary: "💰",
      Freelance: "💼",
      Investment: "📈",
      Gift: "🎁",
      Refund: "↩️",
      Other: "💳",
      "Other Income": "💵",
    }
    return icons[category] || "💳"
  }

  const getAdviceColor = (adviceType: string) => {
    switch (adviceType) {
      case "good_habit":
        return "bg-green-100 text-green-800 border-green-200"
      case "bad_habit":
        return "bg-red-100 text-red-800 border-red-200"
      case "suggestion":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions?.map((transaction) => (
            <div key={transaction.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.merchant || transaction.category}</p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}$
                    {Number(transaction.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
              </div>

              {/* Display spending advice if available */}
              {transaction.spending_advice && transaction.spending_advice.length > 0 && (
                <div className="mt-3 ml-13">
                  {transaction.spending_advice.map((advice: any, index: number) => (
                    <div key={index} className={`text-xs p-2 rounded-lg border ${getAdviceColor(advice.advice_type)}`}>
                      <strong>
                        {advice.advice_type === "good_habit" && "✅ Good habit: "}
                        {advice.advice_type === "bad_habit" && "⚠️ Watch out: "}
                        {advice.advice_type === "suggestion" && "💡 Tip: "}
                      </strong>
                      {advice.advice_text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!transactions ||
            (transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started!</p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
