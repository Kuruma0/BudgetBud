"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

interface BuckRewardNotificationProps {
  userId: string
  transactionId: string
  adviceText: string
}

export function BuckRewardNotification({ userId, transactionId, adviceText }: BuckRewardNotificationProps) {
  const [bucksAwarded, setBucksAwarded] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function awardBucksForGoodHabit() {
      try {
        // Calculate buck amount based on advice quality (simple algorithm)
        const buckAmount = Math.floor(Math.random() * 15) + 10 // 10-25 bucks for good habits

        const response = await fetch("/api/award-bucks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: buckAmount,
            description: `Good financial habit: ${adviceText.substring(0, 50)}...`,
            transactionType: "earned_good_habit",
          }),
        })

        if (response.ok) {
          setBucksAwarded(buckAmount)
        }
      } catch (error) {
        console.error("Error awarding bucks:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only award once per transaction
    const awardedKey = `bucks_awarded_${transactionId}`
    if (!localStorage.getItem(awardedKey)) {
      awardBucksForGoodHabit()
      localStorage.setItem(awardedKey, "true")
    } else {
      setLoading(false)
    }
  }, [userId, transactionId, adviceText])

  if (loading || bucksAwarded === null) {
    return null
  }

  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 mt-1">
      <Coins className="h-3 w-3 mr-1" />+{bucksAwarded} Bucks earned!
    </Badge>
  )
}
