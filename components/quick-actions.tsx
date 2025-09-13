"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Upload, Target } from "lucide-react"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { SMSImportModal } from "@/components/sms-import-modal"
import Link from "next/link"

export function QuickActions() {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showSMSImport, setShowSMSImport] = useState(false)

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              className="flex-1 min-w-[140px] bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setShowAddTransaction(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-w-[140px] border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              onClick={() => setShowSMSImport(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import SMS
            </Button>
            <Link href="/goals" className="flex-1 min-w-[140px]">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                <Target className="w-4 h-4 mr-2" />
                Set Goal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <AddTransactionModal open={showAddTransaction} onOpenChange={setShowAddTransaction} />
      <SMSImportModal open={showSMSImport} onOpenChange={setShowSMSImport} />
    </>
  )
}
