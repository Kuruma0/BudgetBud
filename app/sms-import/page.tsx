import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SMSImportHistory } from "@/components/sms-import-history"
import { Upload, Smartphone, Zap } from "lucide-react"

export default async function SMSImportPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <DashboardHeader user={data.user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Import</h1>
          <p className="text-gray-600 mt-1">Automatically track transactions from your bank SMS messages</p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Copy SMS</h3>
              <p className="text-sm text-gray-600">Copy bank transaction SMS messages from your phone</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Paste & Import</h3>
              <p className="text-sm text-gray-600">Paste them into Budget Buddy for automatic parsing</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Auto-Categorize</h3>
              <p className="text-sm text-gray-600">AI automatically categorizes and adds spending advice</p>
            </CardContent>
          </Card>
        </div>

        {/* Supported formats */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle>Supported SMS Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Debit/Purchase Transactions</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-700">
                  "Your account has been debited by Rs.250.00 on 15-Dec-24 at STARBUCKS COFFEE for Card ending 1234."
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Credit/Income Transactions</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-700">
                  "Rs.1,200.00 credited to your account on 14-Dec-24 from SALARY DEPOSIT."
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">ATM Withdrawals</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-700">
                  "ATM withdrawal of Rs.500.00 from your account on 13-Dec-24 at SBI ATM MAIN STREET."
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <SMSImportHistory userId={data.user.id} />
      </main>
    </div>
  )
}
