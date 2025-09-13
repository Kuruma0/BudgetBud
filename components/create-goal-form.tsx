"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface CreateGoalFormProps {
  onSuccess: () => void
}

export function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const [title, setTitle] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const categories = [
    "Emergency Fund",
    "Vacation",
    "Car",
    "House",
    "Education",
    "Investment",
    "Wedding",
    "Retirement",
    "Other",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("savings_goals").insert({
        user_id: user.id,
        title,
        target_amount: Number.parseFloat(targetAmount),
        target_date: targetDate || null,
        category: category || "Other",
        current_amount: 0,
        is_active: true,
      })

      if (error) throw error

      onSuccess()
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          placeholder="e.g., Emergency Fund"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount (ZAR)</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="1000.00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetDate">Target Date (Optional)</Label>
        <Input
          id="targetDate"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Goal"}
        </Button>
      </div>
    </form>
  )
}
