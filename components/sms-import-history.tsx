import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar } from "lucide-react"

interface SMSImportHistoryProps {
  userId: string
}

export async function SMSImportHistory({ userId }: SMSImportHistoryProps) {
  const supabase = await createClient()

  // Get transactions that were imported from SMS
  const { data: smsTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .not("sms_content", "is", null)
    .order("created_at", { ascending: false })
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

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span>Recent SMS Imports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {smsTransactions && smsTransactions.length > 0 ? (
          <div className="space-y-4">
            {smsTransactions.map((transaction) => (
              <div key={transaction.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.merchant || transaction.category}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </span>
                      </div>
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
                    <Badge variant="outline" className="text-xs mt-1">
                      SMS Import
                    </Badge>
                  </div>
                </div>

                {/* Show original SMS content */}
                <div className="ml-13 mt-2">
                  <details className="group">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View original SMS
                    </summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 border">
                      {transaction.sms_content}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SMS imports yet</h3>
            <p className="text-gray-600">Import your first bank SMS to see the history here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
