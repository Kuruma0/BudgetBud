"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Mail, Calendar } from "lucide-react"
import Link from "next/link"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        redirect("/auth/login")
      }

      setUser(data.user)

      // Get user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single()

      setProfile(profileData)
      setMonthlyBudget(String(profileData?.monthly_budget || ""))
      setLoading(false)
    }

    getUser()
  }, [supabase])

  const handleUpdateProfile = async () => {
    if (!user) return

    setSaving(true)
    await supabase.from("user_profiles").upsert({
      user_id: user.id,
      monthly_budget: Number.parseFloat(monthlyBudget) || 0,
    })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-pulse">Loading account...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Monthly Budget (ZAR)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="Enter your monthly budget"
                />
              </div>
              <Button onClick={handleUpdateProfile} disabled={saving}>
                {saving ? "Saving..." : "Update Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
