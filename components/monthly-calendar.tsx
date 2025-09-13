"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Calendar, CheckCircle } from "lucide-react"

interface MonthlyCalendarProps {
  userId: string
}

export function MonthlyCalendar({ userId }: MonthlyCalendarProps) {
  const [loginDays, setLoginDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLoginDays() {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data } = await supabase
        .from("daily_logins")
        .select("login_date")
        .eq("user_id", userId)
        .gte("login_date", `${currentMonth}-01`)
        .lt("login_date", `${currentMonth}-32`)

      setLoginDays(data?.map((d) => d.login_date) || [])
      setLoading(false)
    }

    fetchLoginDays()
  }, [userId, supabase])

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const hasLogin = loginDays.includes(dateString)
      const isToday = day === currentDate.getDate()

      days.push(
        <div
          key={day}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm relative ${
            isToday
              ? "bg-emerald-500 text-white font-bold"
              : hasLogin
                ? "bg-emerald-100 text-emerald-700 font-medium"
                : "text-gray-400"
          }`}
        >
          {day}
          {hasLogin && !isToday && <CheckCircle className="h-3 w-3 text-emerald-500 absolute -top-1 -right-1" />}
        </div>,
      )
    }

    return days
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Login Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading calendar...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {monthNames[currentMonth]} {currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayNames.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Logged in {loginDays.length} days this month</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-100 rounded-full"></div>
              <span>Login day</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
