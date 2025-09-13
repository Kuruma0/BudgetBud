import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BalanceCard } from "@/components/balance-card"
import { TransactionsList } from "@/components/transactions-list"
import { QuickActions } from "@/components/quick-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { SpendingInsights } from "@/components/spending-insights"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <BalanceCard userId={data.user.id} />
        <QuickActions />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionsList userId={data.user.id} />
          <SpendingInsights userId={data.user.id} />
        </div>
      </main>
    </div>
  )
}
