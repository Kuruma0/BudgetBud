import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BalanceCardProps {
  userId: string
  balance: number
  monthlySpending: number
}

export function BalanceCard({ userId, balance, monthlySpending }: BalanceCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-orange-100">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-4xl font-bold">
              R{balance.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-orange-100 text-sm">
              {balance >= 0 ? "You're doing great!" : "Time to review your spending"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-900">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              R{monthlySpending.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-gray-600 text-sm">Total spent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
