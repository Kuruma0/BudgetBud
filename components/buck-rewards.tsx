"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Coins, TrendingUp, Award } from "lucide-react"

interface BuckRewardsProps {
  userId: string
}

interface BuckTransaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
}

export function BuckRewards({ userId }: BuckRewardsProps) {
  const [bucks, setBucks] = useState(0)
  const [recentEarnings, setRecentEarnings] = useState<BuckTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBuckData() {
      // Get user's current bucks
      const { data: bucksData } = await supabase.rpc("get_user_bucks", {
        user_uuid: userId,
      })

      // Get recent buck earnings (positive amounts only)
      const { data: earnings } = await supabase
        .from("buck_transactions")
        .select("*")
        .eq("user_id", userId)
        .gt("amount", 0)
        .order("created_at", { ascending: false })
        .limit(5)

      setBucks(bucksData || 0)
      setRecentEarnings(earnings || [])
      setLoading(false)
    }

    fetchBuckData()
  }, [userId, supabase])

  const getRewardIcon = (transactionType: string) => {
    switch (transactionType) {
      case "earned_good_habit":
        return "✅"
      case "earned_goal":
        return "🎯"
      case "earned_achievement":
        return "🏆"
      default:
        return "💰"
    }
  }

  const getRewardMessage = () => {
    if (bucks >= 500) return "You're a financial superstar! 🌟"
    if (bucks >= 200) return "Great job building your wealth! 💪"
    if (bucks >= 100) return "You're making smart money moves! 📈"
    if (bucks >= 50) return "Keep up the good financial habits! 👍"
    return "Start earning bucks with good financial decisions! 🚀"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Buck Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading your rewards...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Buck Rewards
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-500" />
            <span className="text-3xl font-bold text-yellow-600">{bucks}</span>
            <span className="text-lg text-yellow-600">Bucks</span>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Award className="h-3 w-3 mr-1" />
            Earned
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-green-700">Recent Earnings</span>
          </div>

          {recentEarnings.length > 0 ? (
            <div className="space-y-2">
              {recentEarnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{getRewardIcon(earning.transaction_type)}</span>
                    <span className="text-gray-700">{earning.description}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    <span className="font-bold text-green-600">+{earning.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No earnings yet. Make good financial decisions to earn bucks!</p>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{getRewardMessage()}</p>
          <p className="text-xs text-gray-500 mt-1">Use your bucks to build your virtual town!</p>
        </div>
      </CardContent>
    </Card>
  )
}
