import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Smartphone, Target, Trophy, Brain } from "lucide-react"
import Link from "next/link"

export default function AppInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">App Information</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold text-emerald-600">Budget Buddy</CardTitle>
              <p className="text-center text-gray-600">Your personal finance companion for better spending habits</p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-gray-500">
                Version 1.0.0 • Made with ❤️ for better financial health
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                  SMS Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automatically track your spending by reading bank SMS notifications. Our smart parser recognizes
                  transactions from major South African banks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Smart Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set and track your savings goals with visual progress indicators. Get motivated with milestone
                  celebrations and progress insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn achievements for consistent app usage and good financial habits. Build streaks and unlock rewards
                  for staying on track.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get personalized spending advice powered by AI. Learn from your habits and receive actionable tips to
                  improve your financial health.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600">• Your financial data is encrypted and stored securely</p>
              <p className="text-gray-600">• SMS reading is done locally on your device</p>
              <p className="text-gray-600">• We never share your personal information with third parties</p>
              <p className="text-gray-600">• All data processing complies with South African privacy laws</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
