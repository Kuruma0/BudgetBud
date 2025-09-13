import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Calendar } from "lucide-react"

interface LoginStreakCardProps {
  userId: string
}

export async function LoginStreakCard({ userId }: LoginStreakCardProps) {
  const supabase = await createClient()

  // Get current login streak
  const { data: streakData } = await supabase.rpc("get_login_streak", {
    user_uuid: userId,
  })

  const currentStreak = streakData || 0

  // Check which streak achievements have been earned
  const { data: streakAchievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("achievement_type", "login_streak")
    .order("days_count", { ascending: true })

  const streakMilestones = [3, 5, 7, 14, 30]
  const earnedStreaks = new Set(streakAchievements?.map((a) => a.days_count) || [])

  // Check if we need to award new achievements
  const newAchievements = streakMilestones.filter(
    (milestone) => currentStreak >= milestone && !earnedStreaks.has(milestone),
  )

  // Award new achievements
  if (newAchievements.length > 0) {
    const achievementsToInsert = newAchievements.map((days) => ({
      user_id: userId,
      achievement_type: "login_streak",
      achievement_name: `${days} Day Login Streak`,
      description: `Logged in for ${days} consecutive days`,
      days_count: days,
    }))

    await supabase.from("achievements").insert(achievementsToInsert)
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return "🔥"
    if (streak >= 14) return "⚡"
    if (streak >= 7) return "🌟"
    if (streak >= 3) return "✨"
    return "📅"
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "from-red-500 to-orange-500"
    if (streak >= 14) return "from-purple-500 to-pink-500"
    if (streak >= 7) return "from-blue-500 to-cyan-500"
    if (streak >= 3) return "from-green-500 to-emerald-500"
    return "from-gray-400 to-gray-500"
  }

  const getNextMilestone = (streak: number) => {
    return streakMilestones.find((milestone) => milestone > streak) || null
  }

  const nextMilestone = getNextMilestone(currentStreak)

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span>Login Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Streak */}
          <div className="text-center">
            <div
              className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${getStreakColor(currentStreak)} flex items-center justify-center`}
            >
              <span className="text-3xl">{getStreakIcon(currentStreak)}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{currentStreak}</p>
            <p className="text-gray-600">Day{currentStreak !== 1 ? "s" : ""} in a row</p>
            {nextMilestone && (
              <p className="text-sm text-gray-500 mt-2">
                {nextMilestone - currentStreak} more day{nextMilestone - currentStreak !== 1 ? "s" : ""} to reach{" "}
                {nextMilestone} days!
              </p>
            )}
          </div>

          {/* Streak Milestones */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">Streak Milestones</h4>
            {streakMilestones.map((milestone) => {
              const isEarned = earnedStreaks.has(milestone)
              const isCurrent = currentStreak >= milestone

              return (
                <div key={milestone} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrent ? "bg-emerald-100" : "bg-gray-100"
                      }`}
                    >
                      {isCurrent ? (
                        <span className="text-emerald-600 text-sm">✓</span>
                      ) : (
                        <Calendar className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className={`${isCurrent ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {milestone} Days
                    </span>
                  </div>
                  {isEarned && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Earned</Badge>}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
