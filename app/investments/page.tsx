"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LearningCenter } from "@/components/learning-center"
import { InvestmentInsights } from "@/components/investment-insights"
import { authService, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function InvestmentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <DashboardHeader user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Learning Center</h1>
          <p className="text-gray-600">Learn about investing and build your financial knowledge</p>
        </div>

        <Tabs defaultValue="learn" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-6">
            <LearningCenter userId={user?.id} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <InvestmentInsights userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
