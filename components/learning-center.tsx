"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Play, Award } from "lucide-react"

interface LearningProgress {
  lesson_id: string
  lesson_title: string
  completed: boolean
  completed_at: string | null
}

interface LearningCenterProps {
  userId: string
}

const LESSONS = [
  {
    id: "basics-1",
    title: "What is Investing?",
    description: "Learn the fundamentals of investing and why it's important for building wealth",
    category: "Basics",
    duration: "5 min",
    content: `
      <h3>What is Investing?</h3>
      <p>Investing is the act of putting money into financial assets with the expectation of generating returns over time. Unlike saving, which focuses on preserving money, investing aims to grow your wealth.</p>
      
      <h4>Key Concepts:</h4>
      <ul>
        <li><strong>Risk vs Return:</strong> Higher potential returns usually come with higher risk</li>
        <li><strong>Compound Interest:</strong> Your returns earn returns, accelerating growth over time</li>
        <li><strong>Diversification:</strong> Spreading investments across different assets reduces risk</li>
        <li><strong>Time Horizon:</strong> Longer investment periods can help weather market volatility</li>
      </ul>
      
      <h4>Why Invest?</h4>
      <p>Inflation erodes the purchasing power of money over time. By investing, you can potentially grow your wealth faster than inflation, preserving and increasing your buying power.</p>
    `,
  },
  {
    id: "basics-2",
    title: "Types of Investments",
    description: "Explore different investment options available in South Africa",
    category: "Basics",
    duration: "7 min",
    content: `
      <h3>Types of Investments in South Africa</h3>
      
      <h4>1. Stocks (Equities)</h4>
      <p>Shares in companies listed on the JSE. You become a partial owner and benefit from company growth.</p>
      
      <h4>2. Bonds</h4>
      <p>Government or corporate debt instruments. You lend money and receive regular interest payments.</p>
      
      <h4>3. Unit Trusts (Mutual Funds)</h4>
      <p>Pooled investments managed by professionals, offering instant diversification.</p>
      
      <h4>4. Exchange Traded Funds (ETFs)</h4>
      <p>Funds that track indices, sectors, or themes. Lower fees than unit trusts.</p>
      
      <h4>5. Property (REITs)</h4>
      <p>Real Estate Investment Trusts allow you to invest in property without buying physical assets.</p>
      
      <h4>6. Tax-Free Savings Accounts</h4>
      <p>Special accounts where investment growth is not taxed. Annual limit of R36,000.</p>
    `,
  },
  {
    id: "jse-1",
    title: "Understanding the JSE",
    description: "Learn about the Johannesburg Stock Exchange and how it works",
    category: "JSE",
    duration: "6 min",
    content: `
      <h3>The Johannesburg Stock Exchange (JSE)</h3>
      <p>The JSE is Africa's largest stock exchange and the 19th largest in the world by market capitalization.</p>
      
      <h4>Key Indices:</h4>
      <ul>
        <li><strong>JSE All Share Index (ALSI):</strong> Tracks the performance of all JSE-listed shares</li>
        <li><strong>Top 40:</strong> The 40 largest companies by market cap</li>
        <li><strong>Mid Cap:</strong> Medium-sized companies</li>
        <li><strong>Small Cap:</strong> Smaller companies with growth potential</li>
      </ul>
      
      <h4>Major Sectors:</h4>
      <ul>
        <li>Mining (Anglo American, BHP Billiton)</li>
        <li>Banking (Standard Bank, FirstRand)</li>
        <li>Retail (Shoprite, Pick n Pay)</li>
        <li>Telecommunications (MTN, Vodacom)</li>
        <li>Technology (Naspers, Prosus)</li>
      </ul>
      
      <h4>Trading Hours:</h4>
      <p>The JSE operates Monday to Friday, 9:00 AM to 5:00 PM SAST.</p>
    `,
  },
  {
    id: "risk-1",
    title: "Understanding Investment Risk",
    description: "Learn about different types of investment risks and how to manage them",
    category: "Risk Management",
    duration: "8 min",
    content: `
      <h3>Types of Investment Risk</h3>
      
      <h4>1. Market Risk</h4>
      <p>The risk that the entire market will decline, affecting most investments.</p>
      
      <h4>2. Company-Specific Risk</h4>
      <p>Risk related to individual companies, such as poor management or industry challenges.</p>
      
      <h4>3. Currency Risk</h4>
      <p>For international investments, changes in exchange rates can affect returns.</p>
      
      <h4>4. Inflation Risk</h4>
      <p>The risk that inflation will erode the purchasing power of your returns.</p>
      
      <h4>5. Liquidity Risk</h4>
      <p>The risk that you won't be able to sell an investment quickly when needed.</p>
      
      <h4>Risk Management Strategies:</h4>
      <ul>
        <li><strong>Diversification:</strong> Don't put all eggs in one basket</li>
        <li><strong>Asset Allocation:</strong> Spread investments across different asset classes</li>
        <li><strong>Regular Review:</strong> Monitor and rebalance your portfolio</li>
        <li><strong>Long-term Perspective:</strong> Time can help smooth out volatility</li>
      </ul>
    `,
  },
  {
    id: "strategy-1",
    title: "Building Your Investment Strategy",
    description: "Create a personalized investment approach based on your goals",
    category: "Strategy",
    duration: "10 min",
    content: `
      <h3>Creating Your Investment Strategy</h3>
      
      <h4>Step 1: Define Your Goals</h4>
      <ul>
        <li>Retirement planning</li>
        <li>Buying a home</li>
        <li>Children's education</li>
        <li>Building an emergency fund</li>
      </ul>
      
      <h4>Step 2: Determine Your Time Horizon</h4>
      <ul>
        <li><strong>Short-term (1-3 years):</strong> Conservative investments</li>
        <li><strong>Medium-term (3-10 years):</strong> Balanced approach</li>
        <li><strong>Long-term (10+ years):</strong> Growth-focused investments</li>
      </ul>
      
      <h4>Step 3: Assess Your Risk Tolerance</h4>
      <p>Consider your emotional comfort with market volatility and your financial ability to handle losses.</p>
      
      <h4>Step 4: Choose Your Asset Allocation</h4>
      <p>Example allocations by age:</p>
      <ul>
        <li><strong>20s-30s:</strong> 80% stocks, 20% bonds</li>
        <li><strong>40s-50s:</strong> 60% stocks, 40% bonds</li>
        <li><strong>60s+:</strong> 40% stocks, 60% bonds</li>
      </ul>
      
      <h4>Step 5: Start Investing</h4>
      <p>Begin with small amounts and increase gradually as you learn and earn more.</p>
    `,
  },
]

export function LearningCenter({ userId }: LearningCenterProps) {
  const [progress, setProgress] = useState<LearningProgress[]>([])
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [userId])

  const fetchProgress = async () => {
    try {
      const storageKey = `kaching_learning_progress_${userId}`
      const savedProgress = localStorage.getItem(storageKey)
      setProgress(savedProgress ? JSON.parse(savedProgress) : [])
    } catch (error) {
      console.error("Error fetching learning progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const markLessonComplete = async (lessonId: string, lessonTitle: string) => {
    try {
      const storageKey = `kaching_learning_progress_${userId}`
      const newProgress = {
        lesson_id: lessonId,
        lesson_title: lessonTitle,
        completed: true,
        completed_at: new Date().toISOString(),
      }

      // Update local state
      setProgress((prev) => {
        const existing = prev.find((p) => p.lesson_id === lessonId)
        let updatedProgress
        if (existing) {
          updatedProgress = prev.map((p) =>
            p.lesson_id === lessonId ? { ...p, completed: true, completed_at: new Date().toISOString() } : p,
          )
        } else {
          updatedProgress = [...prev, newProgress]
        }

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedProgress))
        return updatedProgress
      })
    } catch (error) {
      console.error("Error marking lesson complete:", error)
    }
  }

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed)
  }

  const completedLessons = progress.filter((p) => p.completed).length
  const progressPercentage = (completedLessons / LESSONS.length) * 100

  const categories = [...new Set(LESSONS.map((lesson) => lesson.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Learning Progress
          </CardTitle>
          <CardDescription>Complete lessons to build your investment knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {completedLessons} of {LESSONS.length} lessons completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Lessons by Category */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {LESSONS.filter((lesson) => lesson.category === category).map((lesson) => (
                <Card key={lesson.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{lesson.title}</h3>
                          {isLessonCompleted(lesson.id) && <CheckCircle className="h-5 w-5 text-green-600" />}
                          <Badge variant="secondary">{lesson.duration}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{lesson.description}</p>
                      </div>
                      <Button
                        onClick={() => setSelectedLesson(lesson)}
                        variant={isLessonCompleted(lesson.id) ? "outline" : "default"}
                        className={!isLessonCompleted(lesson.id) ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {isLessonCompleted(lesson.id) ? "Review" : "Start"}
                        <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedLesson.title}
                <Button variant="ghost" onClick={() => setSelectedLesson(null)}>
                  ×
                </Button>
              </CardTitle>
              <CardDescription>
                {selectedLesson.category} • {selectedLesson.duration}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedLesson(null)} className="flex-1">
                  Close
                </Button>
                {!isLessonCompleted(selectedLesson.id) && (
                  <Button
                    onClick={() => {
                      markLessonComplete(selectedLesson.id, selectedLesson.title)
                      setSelectedLesson(null)
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
