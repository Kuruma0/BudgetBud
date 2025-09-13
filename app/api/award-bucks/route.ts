import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, transactionType } = await request.json()

    if (!amount || !description || !transactionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Award bucks using the database function
    const { error } = await supabase.rpc("award_bucks", {
      user_uuid: user.id,
      buck_amount: amount,
      transaction_description: description,
    })

    if (error) {
      console.error("Error awarding bucks:", error)
      return NextResponse.json({ error: "Failed to award bucks" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in award-bucks API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
