import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { GoalsOverview } from "@/components/goals-overview"
import { CreateGoalButton } from "@/components/create-goal-button"

export default async function GoalsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
            <p className="text-gray-600 mt-1">Track your progress towards financial milestones</p>
          </div>
          <CreateGoalButton />
        </div>

        <GoalsOverview userId={data.user.id} />
      </main>
    </div>
  )
}
