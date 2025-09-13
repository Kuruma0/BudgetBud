"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Info, LogOut, TrendingUp, Target, Trophy, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = () => {
    authService.logout()
    router.push("/auth/login")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              setOpen(false)
              router.push("/dashboard")
            }}
          >
            <Wallet className="h-5 w-5" />
            Balance
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              setOpen(false)
              router.push("/goals")
            }}
          >
            <Target className="h-5 w-5" />
            Goals
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              setOpen(false)
              router.push("/investments")
            }}
          >
            <TrendingUp className="h-5 w-5" />
            Investments
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              setOpen(false)
              router.push("/achievements")
            }}
          >
            <Trophy className="h-5 w-5" />
            Achievements
          </Button>

          <div className="border-t pt-4 mt-6">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                setOpen(false)
                router.push("/account")
              }}
            >
              <User className="h-5 w-5" />
              Account Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                setOpen(false)
                router.push("/app-info")
              }}
            >
              <Info className="h-5 w-5" />
              App Information
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
