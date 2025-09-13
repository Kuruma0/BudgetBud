import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EnhancedBalanceCard } from "@/components/enhanced-balance-card"
import { TransactionsList } from "@/components/transactions-list"
import { QuickActions } from "@/components/quick-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { SpendingInsights } from "@/components/spending-insights"
import { MonthlyCalendar } from "@/components/monthly-calendar"
import { VirtualTown } from "@/components/virtual-town"
import { BuckRewards } from "@/components/buck-rewards"
import { checkAndAwardAchievements } from "@/lib/achievements"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Record daily login
  await supabase.from("daily_logins").upsert(
    {
      user_id: data.user.id,
      login_date: new Date().toISOString().split("T")[0],
    },
    {
      onConflict: "user_id,login_date",
    },
  )

  await checkAndAwardAchievements(data.user.id)

  const { data: balanceData } = await supabase.from("transactions").select("amount").eq("user_id", data.user.id)

  const balance = balanceData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0

  // Calculate monthly spending (negative amounts only for current month)
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const { data: monthlyData } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", data.user.id)
    .gte("created_at", `${currentMonth}-01`)
    .lt("amount", 0)

  const monthlySpending = Math.abs(monthlyData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <DashboardHeader user={data.user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <EnhancedBalanceCard userId={data.user.id} balance={balance} monthlySpending={monthlySpending} />

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyCalendar userId={data.user.id} />
          <BuckRewards userId={data.user.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VirtualTown userId={data.user.id} />
          <SpendingInsights userId={data.user.id} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TransactionsList userId={data.user.id} />
        </div>
      </main>
    </div>
  )
}
