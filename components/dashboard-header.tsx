"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-white">BB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Budget Buddy</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.user_metadata?.full_name || user.email}</p>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium">
              Balance
            </Link>
            <Link href="/goals" className="text-gray-700 hover:text-emerald-600 font-medium">
              Goals
            </Link>
            <Link href="/achievements" className="text-gray-700 hover:text-emerald-600 font-medium">
              Achievements
            </Link>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
