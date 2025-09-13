import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { smsText } = await request.json()

    if (!smsText) {
      return NextResponse.json({ error: "SMS text is required" }, { status: 400 })
    }

    // Parse the SMS text
    const parsedTransaction = parseBankSMS(smsText)

    if (!parsedTransaction) {
      return NextResponse.json({ error: "Could not parse SMS" }, { status: 400 })
    }

    // Insert the transaction
    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: parsedTransaction.amount,
        type: parsedTransaction.type,
        category: parsedTransaction.category,
        description: parsedTransaction.description,
        merchant: parsedTransaction.merchant,
        sms_content: smsText,
        transaction_date: parsedTransaction.date,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 })
    }

    // Generate AI advice for expense transactions
    if (parsedTransaction.type === "expense" && transaction) {
      try {
        await fetch(`${request.nextUrl.origin}/api/generate-advice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: request.headers.get("Authorization") || "",
          },
          body: JSON.stringify({
            transactionId: transaction.id,
          }),
        })
      } catch (adviceError) {
        console.error("Error generating advice:", adviceError)
      }
    }

    return NextResponse.json({
      success: true,
      transaction: parsedTransaction,
      id: transaction.id,
    })
  } catch (error) {
    console.error("Error parsing SMS:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function parseBankSMS(smsText: string) {
  const text = smsText.toLowerCase()

  // Common patterns for different banks and transaction types
  const patterns = [
    // Debit/Purchase patterns
    {
      regex: /(?:debited|spent|purchase|paid)\s*(?:rs\.?|₹|\$)?\s*([0-9,]+\.?\d*)/i,
      type: "expense" as const,
    },
    // Credit/Deposit patterns
    {
      regex: /(?:credited|received|deposit|salary)\s*(?:rs\.?|₹|\$)?\s*([0-9,]+\.?\d*)/i,
      type: "income" as const,
    },
    // ATM withdrawal
    {
      regex: /(?:atm|withdrawal|cash)\s*(?:rs\.?|₹|\$)?\s*([0-9,]+\.?\d*)/i,
      type: "expense" as const,
    },
  ]

  let amount = 0
  let type: "income" | "expense" = "expense"

  // Extract amount and type
  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match) {
      amount = Number.parseFloat(match[1].replace(/,/g, ""))
      type = pattern.type
      break
    }
  }

  if (amount === 0) {
    return null
  }

  // Extract merchant/description
  let merchant = ""
  let description = ""

  // Common merchant patterns
  const merchantPatterns = [
    /(?:at|from)\s+([a-zA-Z0-9\s]+?)(?:\s+on|\s+dated|\s*$)/i,
    /(?:to|towards)\s+([a-zA-Z0-9\s]+?)(?:\s+on|\s+dated|\s*$)/i,
  ]

  for (const pattern of merchantPatterns) {
    const match = smsText.match(pattern)
    if (match) {
      merchant = match[1].trim()
      break
    }
  }

  // Determine category based on merchant or keywords
  const category = categorizeTransaction(smsText, merchant, type)

  // Extract date (default to current date if not found)
  let transactionDate = new Date()
  const dateMatch = smsText.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i)
  if (dateMatch) {
    const [, day, month, year] = dateMatch
    transactionDate = new Date(
      Number.parseInt(year.length === 2 ? `20${year}` : year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
    )
  }

  description = merchant || `${type === "income" ? "Income" : "Expense"} from SMS`

  return {
    amount,
    type,
    category,
    description,
    merchant: merchant || "Unknown",
    date: transactionDate.toISOString(),
  }
}

function categorizeTransaction(smsText: string, merchant: string, type: "income" | "expense"): string {
  const text = `${smsText} ${merchant}`.toLowerCase()

  if (type === "income") {
    if (text.includes("salary") || text.includes("payroll")) return "Salary"
    if (text.includes("freelance") || text.includes("contract")) return "Freelance"
    if (text.includes("dividend") || text.includes("interest")) return "Investment"
    if (text.includes("refund") || text.includes("return")) return "Refund"
    return "Other Income"
  }

  // Expense categorization
  if (text.includes("atm") || text.includes("cash")) return "Other"
  if (text.includes("uber") || text.includes("ola") || text.includes("taxi") || text.includes("metro"))
    return "Transportation"
  if (text.includes("starbucks") || text.includes("cafe") || text.includes("coffee")) return "Coffee"
  if (
    text.includes("restaurant") ||
    text.includes("hotel") ||
    text.includes("food") ||
    text.includes("zomato") ||
    text.includes("swiggy")
  )
    return "Food & Dining"
  if (text.includes("grocery") || text.includes("supermarket") || text.includes("mart")) return "Groceries"
  if (text.includes("petrol") || text.includes("gas") || text.includes("fuel")) return "Gas"
  if (text.includes("movie") || text.includes("cinema") || text.includes("entertainment")) return "Entertainment"
  if (text.includes("medical") || text.includes("hospital") || text.includes("pharmacy")) return "Healthcare"
  if (text.includes("electricity") || text.includes("water") || text.includes("bill")) return "Bills & Utilities"
  if (text.includes("amazon") || text.includes("flipkart") || text.includes("shopping")) return "Shopping"
  if (text.includes("netflix") || text.includes("spotify") || text.includes("subscription")) return "Subscriptions"

  return "Other"
}
