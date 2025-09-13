import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp, Award } from "lucide-react"

interface AchievementsOverviewProps {
  userId: string
}

export async function AchievementsOverview({ userId }: AchievementsOverviewProps) {
  const supabase = await createClient()

  // Get all achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  // Get user stats for potential achievements
  const { data: goals } = await supabase.from("savings_goals").select("*").eq("user_id", userId)

  const { data: transactions } = await supabase.from("transactions").select("amount, type").eq("user_id", userId)

  // Calculate stats
  const totalSaved = goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0
  const completedGoals = goals?.filter((goal) => Number(goal.current_amount) >= Number(goal.target_amount)).length || 0
  const totalTransactions = transactions?.length || 0

  // Check for savings milestones
  const savingsMilestones = [100, 500, 1000, 5000, 10000]
  const earnedSavings = new Set(
    achievements?.filter((a) => a.achievement_type === "savings_milestone").map((a) => Number(a.amount)) || [],
  )

  const newSavingsAchievements = savingsMilestones.filter(
    (milestone) => totalSaved >= milestone && !earnedSavings.has(milestone),
  )

  // Award new savings achievements
  if (newSavingsAchievements.length > 0) {
    const achievementsToInsert = newSavingsAchievements.map((amount) => ({
      user_id: userId,
      achievement_type: "savings_milestone",
      achievement_name: `R${amount.toLocaleString("en-ZA")} Saved`,
      description: `Reached R${amount.toLocaleString("en-ZA")} in total savings`,
      amount: amount,
    }))

    await supabase.from("achievements").insert(achievementsToInsert)
  }

  const getAchievementIcon = (type: string, name: string) => {
    if (type === "login_streak") return "🔥"
    if (type === "savings_milestone") {
      if (name.includes("R10,000")) return "💎"
      if (name.includes("R5,000")) return "🏆"
      if (name.includes("R1,000")) return "🥇"
      if (name.includes("R500")) return "🥈"
      return "🥉"
    }
    if (type === "spending_goal") return "🎯"
    return "🏅"
  }

  const getAchievementColor = (type: string) => {
    switch (type) {
      case "login_streak":
        return "from-orange-400 to-red-500"
      case "savings_milestone":
        return "from-emerald-400 to-green-500"
      case "spending_goal":
        return "from-blue-400 to-purple-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const achievementStats = [
    {
      icon: Trophy,
      label: "Total Achievements",
      value: achievements?.length || 0,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      icon: Target,
      label: "Goals Completed",
      value: completedGoals,
      color: "text-green-600 bg-green-100",
    },
    {
      icon: TrendingUp,
      label: "Total Saved",
      value: `R${totalSaved.toLocaleString("en-ZA")}`,
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: Award,
      label: "Login Streak",
      value: achievements?.filter((a) => a.achievement_type === "login_streak").length || 0,
      color: "text-purple-600 bg-purple-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievementStats.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earned Achievements */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Earned Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAchievementColor(achievement.achievement_type)} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-xl">
                        {getAchievementIcon(achievement.achievement_type, achievement.achievement_name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{achievement.achievement_name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {achievement.achievement_type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
              <p className="text-gray-600">Start using Budget Buddy to earn your first achievement!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Achievements */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-blue-500" />
            <span>Available Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Login Streak Achievements */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Login Streaks</h4>
              {[3, 5, 7, 14, 30].map((days) => {
                const isEarned = achievements?.some(
                  (a) => a.achievement_type === "login_streak" && a.days_count === days,
                )
                return (
                  <div
                    key={days}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isEarned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🔥</span>
                      <div>
                        <p className="font-medium text-gray-900">{days} Day Streak</p>
                        <p className="text-sm text-gray-600">Login {days} days in a row</p>
                      </div>
                    </div>
                    {isEarned && <Badge className="bg-green-100 text-green-800 border-green-200">Earned</Badge>}
                  </div>
                )
              })}
            </div>

            {/* Savings Achievements */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Savings Milestones</h4>
              {[100, 500, 1000, 5000, 10000].map((amount) => {
                const isEarned = achievements?.some(
                  (a) => a.achievement_type === "savings_milestone" && Number(a.amount) === amount,
                )
                const icon =
                  amount >= 10000 ? "💎" : amount >= 5000 ? "🏆" : amount >= 1000 ? "🥇" : amount >= 500 ? "🥈" : "🥉"

                return (
                  <div
                    key={amount}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isEarned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">R{amount.toLocaleString("en-ZA")} Saved</p>
                        <p className="text-sm text-gray-600">
                          Reach R{amount.toLocaleString("en-ZA")} in total savings
                        </p>
                      </div>
                    </div>
                    {isEarned && <Badge className="bg-green-100 text-green-800 border-green-200">Earned</Badge>}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
