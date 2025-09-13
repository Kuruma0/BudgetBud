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

    const { transactionId } = await request.json()

    // Get the transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Get user's recent spending patterns
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select("amount, category, type, transaction_date")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .order("transaction_date", { ascending: false })
      .limit(20)

    // Get user's goals for context
    const { data: goals } = await supabase
      .from("savings_goals")
      .select("title, target_amount, current_amount, target_date")
      .eq("user_id", user.id)
      .eq("is_active", true)

    // Generate advice based on transaction patterns
    const advice = generateSpendingAdvice(transaction, recentTransactions || [], goals || [])

    // Store the advice in the database
    const { error: insertError } = await supabase.from("spending_advice").insert({
      user_id: user.id,
      transaction_id: transactionId,
      advice_text: advice.text,
      advice_type: advice.type,
    })

    if (insertError) {
      console.error("Error storing advice:", insertError)
    }

    return NextResponse.json({ advice })
  } catch (error) {
    console.error("Error generating advice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateSpendingAdvice(transaction: any, recentTransactions: any[], goals: any[]) {
  const amount = Number(transaction.amount)
  const category = transaction.category

  // Calculate category spending patterns
  const categorySpending = recentTransactions
    .filter((t) => t.category === category)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalSpending = recentTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

  const categoryPercentage = totalSpending > 0 ? (categorySpending / totalSpending) * 100 : 0

  // Calculate monthly spending
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlySpending = recentTransactions
    .filter((t) => t.transaction_date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Generate advice based on patterns
  if (category === "Coffee" && amount > 5) {
    return {
      type: "bad_habit",
      text: `That's a pricey coffee! Consider brewing at home to save $${(amount - 3).toFixed(2)} per cup. You could save over $${((amount - 3) * 20).toFixed(0)} monthly.`,
    }
  }

  if (category === "Food & Dining" && categoryPercentage > 30) {
    return {
      type: "bad_habit",
      text: `Dining out represents ${categoryPercentage.toFixed(0)}% of your spending. Try meal prepping to reduce this category and boost your savings.`,
    }
  }

  if (category === "Subscriptions" && amount > 15) {
    return {
      type: "suggestion",
      text: `Review your subscriptions regularly. Cancel unused services and consider sharing family plans to reduce monthly costs.`,
    }
  }

  if (category === "Groceries" && amount < 50) {
    return {
      type: "good_habit",
      text: `Great job keeping grocery costs reasonable! Planning meals and shopping with a list helps maintain this good habit.`,
    }
  }

  if (category === "Transportation" && amount > 50) {
    return {
      type: "suggestion",
      text: `Consider carpooling, public transit, or biking for shorter trips to reduce transportation costs.`,
    }
  }

  if (category === "Entertainment" && categoryPercentage > 15) {
    return {
      type: "suggestion",
      text: `Look for free entertainment options like parks, free museums, or community events to balance your entertainment budget.`,
    }
  }

  if (category === "Bills & Utilities" && amount < 100) {
    return {
      type: "good_habit",
      text: `Your utility costs are well-managed! Energy-efficient habits are paying off and helping your budget.`,
    }
  }

  if (amount > 100 && goals.length > 0) {
    const nearestGoal = goals[0]
    const daysToSave = Math.ceil((Number(nearestGoal.target_amount) - Number(nearestGoal.current_amount)) / 30)
    return {
      type: "suggestion",
      text: `This purchase could fund ${Math.floor(amount / daysToSave)} days toward your "${nearestGoal.title}" goal. Consider if it aligns with your priorities.`,
    }
  }

  if (monthlySpending > 1000) {
    return {
      type: "bad_habit",
      text: `Your monthly spending is quite high at $${monthlySpending.toFixed(0)}. Review your largest expense categories for potential savings.`,
    }
  }

  // Default positive advice
  return {
    type: "good_habit",
    text: `Every purchase is a choice toward your financial goals. You're building great money awareness by tracking your spending!`,
  }
}
