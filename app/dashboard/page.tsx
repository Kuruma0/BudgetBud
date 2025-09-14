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
  
  // Development mode - bypass auth check
  const isDev = process.env.NODE_ENV === 'development';
  if ((error || !data?.user) && !isDev) {
    redirect("/auth/login")
  }

  // Use a default user ID for development
  const userId = isDev ? 'dev-user-id' : data?.user?.id;

  // Record daily login
  await supabase.from("daily_logins").upsert(
    {
      user_id: userId,
      login_date: new Date().toISOString().split("T")[0],
    },
    {
      onConflict: "user_id,login_date",
    },
  )

  await checkAndAwardAchievements(userId)

  const { data: balanceData } = await supabase.from("transactions").select("amount").eq("user_id", userId)

  const balance = balanceData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0

  // Calculate monthly spending (negative amounts only for current month)
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const { data: monthlyData } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", `${currentMonth}-01`)
    .lt("amount", 0)

  const monthlySpending = Math.abs(monthlyData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <DashboardHeader user={isDev ? null : data.user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <EnhancedBalanceCard userId={userId} balance={balance} monthlySpending={monthlySpending} />

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyCalendar userId={userId} />
          <BuckRewards userId={userId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VirtualTown userId={userId} />
          <SpendingInsights userId={userId} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TransactionsList userId={userId} />
        </div>
      </main>
    </div>
  )
}
