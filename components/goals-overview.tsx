import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar, TrendingUp } from "lucide-react"

interface GoalsOverviewProps {
  userId: string
}

export async function GoalsOverview({ userId }: GoalsOverviewProps) {
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getTimeRemaining = (targetDate: string | null) => {
    if (!targetDate) return null

    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "1 day left"
    if (diffDays < 30) return `${diffDays} days left`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`
    return `${Math.ceil(diffDays / 365)} years left`
  }

  const getCategoryIcon = (category: string | null) => {
    const icons: Record<string, string> = {
      "Emergency Fund": "🛡️",
      Vacation: "🏖️",
      Car: "🚗",
      House: "🏠",
      Education: "🎓",
      Investment: "📈",
      Wedding: "💒",
      Retirement: "🏖️",
      Other: "🎯",
    }
    return icons[category || "Other"] || "🎯"
  }

  const getStatusColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return "bg-green-100 text-green-800 border-green-200"
    if (percentage >= 75) return "bg-blue-100 text-blue-800 border-blue-200"
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusText = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return "Completed"
    if (percentage >= 75) return "Almost there"
    if (percentage >= 50) return "Halfway"
    if (percentage >= 25) return "Getting started"
    return "Just started"
  }

  return (
    <div className="space-y-6">
      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{goals?.length || 0}</p>
                <p className="text-gray-600 text-sm">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0).toLocaleString() || "0"}
                </p>
                <p className="text-gray-600 text-sm">Total Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${goals?.reduce((sum, goal) => sum + Number(goal.target_amount), 0).toLocaleString() || "0"}
                </p>
                <p className="text-gray-600 text-sm">Total Target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals?.map((goal) => {
          const progress = getProgressPercentage(Number(goal.current_amount), Number(goal.target_amount))
          const timeRemaining = getTimeRemaining(goal.target_date)

          return (
            <Card key={goal.id} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{getCategoryIcon(goal.category)}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">{goal.title}</CardTitle>
                      <p className="text-sm text-gray-600">{goal.category}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(Number(goal.current_amount), Number(goal.target_amount))}`}>
                    {getStatusText(Number(goal.current_amount), Number(goal.target_amount))}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      $
                      {Number(goal.current_amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      of $
                      {Number(goal.target_amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {timeRemaining && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{timeRemaining}</p>
                      <p className="text-xs text-gray-600">
                        {goal.target_date && new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    $
                    {(Number(goal.target_amount) - Number(goal.current_amount)).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    remaining to reach your goal
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {!goals ||
        (goals.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first savings goal to start tracking your financial progress
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
