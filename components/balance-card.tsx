import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BalanceCardProps {
  userId: string
}

export async function BalanceCard({ userId }: BalanceCardProps) {
  const supabase = await createClient()

  // Get current balance using the database function
  const { data: balanceData } = await supabase.rpc("get_current_balance", {
    user_uuid: userId,
  })

  // Get recent transactions for trend
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("amount, type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate this month's spending
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: monthlySpending } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("transaction_date", `${currentMonth}-01`)
    .lt("transaction_date", `${currentMonth}-32`)

  const totalMonthlySpending = monthlySpending?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const balance = Number(balanceData) || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-emerald-100">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-4xl font-bold">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-emerald-100 text-sm">
              {balance >= 0 ? "You're doing great!" : "Time to review your spending"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-900">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              ${totalMonthlySpending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-gray-600 text-sm">Total spent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
