import { createClient } from "@/lib/supabase/server"

export async function checkAndAwardAchievements(userId: string) {
  const supabase = await createClient()

  // Get current login streak
  const { data: streakData } = await supabase.rpc("get_login_streak", {
    user_uuid: userId,
  })

  const currentStreak = streakData || 0

  // Get existing achievements
  const { data: existingAchievements } = await supabase.from("achievements").select("*").eq("user_id", userId)

  const earnedStreaks = new Set(
    existingAchievements?.filter((a) => a.achievement_type === "login_streak").map((a) => a.days_count) || [],
  )

  const earnedSavings = new Set(
    existingAchievements?.filter((a) => a.achievement_type === "savings_milestone").map((a) => Number(a.amount)) || [],
  )

  const newAchievements = []

  // Check login streak achievements
  const streakMilestones = [3, 5, 7, 14, 30]
  for (const milestone of streakMilestones) {
    if (currentStreak >= milestone && !earnedStreaks.has(milestone)) {
      newAchievements.push({
        user_id: userId,
        achievement_type: "login_streak",
        achievement_name: `${milestone} Day Login Streak`,
        description: `Logged in for ${milestone} consecutive days`,
        days_count: milestone,
      })
    }
  }

  // Check savings achievements
  const { data: goals } = await supabase.from("savings_goals").select("current_amount").eq("user_id", userId)

  const totalSaved = goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0
  const savingsMilestones = [100, 500, 1000, 5000, 10000]

  for (const milestone of savingsMilestones) {
    if (totalSaved >= milestone && !earnedSavings.has(milestone)) {
      newAchievements.push({
        user_id: userId,
        achievement_type: "savings_milestone",
        achievement_name: `$${milestone.toLocaleString()} Saved`,
        description: `Reached $${milestone.toLocaleString()} in total savings`,
        amount: milestone,
      })
    }
  }

  // Insert new achievements
  if (newAchievements.length > 0) {
    await supabase.from("achievements").insert(newAchievements)
  }

  return newAchievements
}
