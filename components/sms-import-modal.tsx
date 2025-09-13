"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

interface SMSImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SMSImportModal({ open, onOpenChange }: SMSImportModalProps) {
  const [smsText, setSmsText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Array<{ success: boolean; transaction?: any; error?: string }>>([])
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const sampleSMS = [
    "Your account has been debited by Rs.250.00 on 15-Dec-24 at STARBUCKS COFFEE for Card ending 1234. Available balance: Rs.15,750.00",
    "Rs.1,200.00 credited to your account on 14-Dec-24 from SALARY DEPOSIT. Available balance: Rs.16,000.00",
    "ATM withdrawal of Rs.500.00 from your account on 13-Dec-24 at SBI ATM MAIN STREET. Available balance: Rs.14,800.00",
    "Purchase of Rs.85.50 at UBER TRIP on 12-Dec-24 using Card ending 1234. Available balance: Rs.15,300.00",
    "Your account debited Rs.2,500.00 on 11-Dec-24 towards GROCERY MART payment. Available balance: Rs.15,385.50",
  ]

  const handleImport = async () => {
    if (!smsText.trim()) {
      setError("Please enter SMS text")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      // Split multiple SMS messages by line breaks
      const smsMessages = smsText
        .split("\n")
        .map((msg) => msg.trim())
        .filter((msg) => msg.length > 0)

      const importResults = []

      for (const message of smsMessages) {
        try {
          const response = await fetch("/api/parse-sms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              smsText: message,
            }),
          })

          const result = await response.json()

          if (response.ok) {
            importResults.push({
              success: true,
              transaction: result.transaction,
            })
          } else {
            importResults.push({
              success: false,
              error: result.error || "Failed to parse SMS",
            })
          }
        } catch (err) {
          importResults.push({
            success: false,
            error: "Network error",
          })
        }
      }

      setResults(importResults)

      // If all successful, close modal after a delay
      if (importResults.every((r) => r.success)) {
        setTimeout(() => {
          onOpenChange(false)
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      setError("Failed to import SMS messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseSample = () => {
    setSmsText(sampleSMS.join("\n\n"))
  }

  const handleReset = () => {
    setSmsText("")
    setResults([])
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Import SMS Transactions</span>
          </DialogTitle>
          <DialogDescription>
            Paste your bank SMS messages below to automatically create transactions. Each SMS should be on a separate
            line.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smsText">SMS Messages</Label>
            <Textarea
              id="smsText"
              placeholder="Paste your bank SMS messages here..."
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={handleUseSample}>
              Use Sample SMS
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Clear
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Import Results</h4>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      {result.success && result.transaction ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {result.transaction.type === "income" ? "+" : "-"}${result.transaction.amount.toFixed(2)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {result.transaction.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{result.transaction.description}</p>
                          <p className="text-xs text-gray-500">{result.transaction.merchant}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-red-900">Failed to parse</p>
                          <p className="text-sm text-red-600">{result.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={isLoading || !smsText.trim()}
            >
              {isLoading ? "Importing..." : "Import SMS"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
