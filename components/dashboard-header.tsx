"use client"

import { Button } from "@/components/ui/button"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService, type User } from "@/lib/auth"

interface DashboardHeaderProps {
  user?: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = () => {
    authService.logout()
    router.push("/auth/login")
  }

  return (
    <header className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-white">KC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Kaching</h1>
              <p className="text-sm text-yellow-100 hidden sm:block">
                Welcome back, {user?.fullName || user?.email?.split("@")[0] || "Guest"}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-white/90 hover:text-white font-medium transition-colors">
              Balance
            </Link>
            <Link href="/goals" className="text-white/90 hover:text-white font-medium transition-colors">
              Goals
            </Link>
            <Link href="/investments" className="text-white/90 hover:text-white font-medium transition-colors">
              Investments
            </Link>
            <Link href="/achievements" className="text-white/90 hover:text-white font-medium transition-colors">
              Achievements
            </Link>
            {user && (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/20 bg-transparent"
              >
                Sign Out
              </Button>
            )}
          </nav>

          <div className="md:hidden">
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
