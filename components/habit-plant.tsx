"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Leaf } from "lucide-react"

interface HabitPlantProps {
  userId: string
}

export function HabitPlant({ userId }: HabitPlantProps) {
  const [habitScore, setHabitScore] = useState(50) // Start at neutral
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function calculateHabitScore() {
      // Get recent spending advice to determine habit score
      const { data: recentAdvice } = await supabase
        .from("spending_advice")
        .select("advice_type")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!recentAdvice || recentAdvice.length === 0) {
        setLoading(false)
        return
      }

      // Calculate score based on advice types
      let score = 50 // Start neutral
      recentAdvice.forEach((advice) => {
        if (advice.advice_type === "good_habit") {
          score += 5
        } else if (advice.advice_type === "bad_habit") {
          score -= 8
        } else if (advice.advice_type === "suggestion") {
          score += 2
        }
      })

      // Keep score between 0 and 100
      score = Math.max(0, Math.min(100, score))
      setHabitScore(score)
      setLoading(false)
    }

    calculateHabitScore()
  }, [userId, supabase])

  const getPlantState = () => {
    if (habitScore >= 80) return { state: "thriving", color: "text-green-500", bgColor: "bg-green-50" }
    if (habitScore >= 60) return { state: "healthy", color: "text-green-400", bgColor: "bg-green-50" }
    if (habitScore >= 40) return { state: "growing", color: "text-yellow-500", bgColor: "bg-yellow-50" }
    if (habitScore >= 20) return { state: "struggling", color: "text-orange-500", bgColor: "bg-orange-50" }
    return { state: "wilting", color: "text-red-500", bgColor: "bg-red-50" }
  }

  const getPlantMessage = () => {
    if (habitScore >= 80) return "Your plant is thriving! Keep up the excellent spending habits!"
    if (habitScore >= 60) return "Your plant is healthy and growing strong!"
    if (habitScore >= 40) return "Your plant is growing steadily. Keep making good choices!"
    if (habitScore >= 20) return "Your plant needs some care. Try to improve your spending habits."
    return "Your plant is wilting. Time to focus on better financial decisions!"
  }

  const renderPlant = () => {
    const { color, bgColor } = getPlantState()
    const leafCount = Math.max(1, Math.floor(habitScore / 20))

    return (
      <div
        className={`${bgColor} rounded-lg p-6 flex items-center justify-center min-h-[200px] flex-col relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute w-1 h-1 bg-white rounded-full animate-bounce"
            style={{ top: "20%", left: "10%", animationDelay: "0s", animationDuration: "8s" }}
          ></div>
          <div
            className="absolute w-1 h-1 bg-white rounded-full animate-bounce"
            style={{ top: "50%", left: "20%", animationDelay: "3s", animationDuration: "10s" }}
          ></div>
          <div
            className="absolute w-1 h-1 bg-white rounded-full animate-bounce"
            style={{ top: "80%", left: "30%", animationDelay: "6s", animationDuration: "12s" }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Pot */}
          <div className="w-16 h-12 bg-amber-600 rounded-b-lg mb-2 shadow-lg"></div>

          <div
            className={`w-2 h-16 ${color.replace("text-", "bg-")} mx-auto relative transition-all duration-500 ${
              habitScore >= 60 ? "animate-pulse" : habitScore >= 20 ? "animate-bounce" : ""
            }`}
            style={{
              animation:
                habitScore >= 60
                  ? "sway 3s ease-in-out infinite"
                  : habitScore >= 20
                    ? "sway 4s ease-in-out infinite"
                    : "sway 6s ease-in-out infinite",
            }}
          >
            {Array.from({ length: leafCount }).map((_, i) => (
              <Leaf
                key={i}
                className={`h-6 w-6 ${color} absolute transition-all duration-500`}
                style={{
                  left: i % 2 === 0 ? "-12px" : "8px",
                  top: `${10 + i * 12}px`,
                  transform: i % 2 === 0 ? "rotate(-45deg)" : "rotate(45deg)",
                  animation: `leafSway ${2.5 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-4 z-10 relative">
          <div className={`text-2xl font-bold ${color} transition-all duration-500`}>{habitScore}%</div>
          <div className="text-sm text-gray-600 mt-1">Habit Health</div>
        </div>

        <style jsx>{`
          @keyframes sway {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            75% { transform: rotate(-2deg); }
          }
          
          @keyframes leafSway {
            0%, 100% { transform: rotate(var(--initial-rotation)) translateY(0px); }
            25% { transform: rotate(calc(var(--initial-rotation) + 5deg)) translateY(-2px); }
            75% { transform: rotate(calc(var(--initial-rotation) - 5deg)) translateY(2px); }
          }
        `}</style>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Your Habit Plant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Growing your plant...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Your Habit Plant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderPlant()}
        <p className="text-sm text-gray-600 text-center mt-4">{getPlantMessage()}</p>
      </CardContent>
    </Card>
  )
}
