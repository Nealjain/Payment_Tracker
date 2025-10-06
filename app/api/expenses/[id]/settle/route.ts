import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// POST - Mark expense split as settled
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const expenseId = params.id
    const supabase = await createClient()

    // Get the split for this user
    const { data: split, error: splitError } = await supabase
      .from("group_expense_splits")
      .select("*, expense:group_expenses(*, group:groups(name))")
      .eq("expense_id", expenseId)
      .eq("user_id", userId)
      .single()

    if (splitError || !split) {
      return NextResponse.json({ success: false, error: "Split not found" }, { status: 404 })
    }

    if (split.is_settled) {
      return NextResponse.json({ success: false, error: "Already settled" }, { status: 400 })
    }

    // Mark as settled
    const { error: updateError } = await supabase
      .from("group_expense_splits")
      .update({
        is_settled: true,
        settled_at: new Date().toISOString(),
      })
      .eq("id", split.id)

    if (updateError) {
      console.error("Error settling split:", updateError)
      return NextResponse.json({ success: false, error: "Failed to settle" }, { status: 500 })
    }

    // Notify the person who paid
    const expense = split.expense as any
    await supabase.rpc("create_notification", {
      p_user_id: expense.paid_by,
      p_type: "payment_received",
      p_title: "Payment Received",
      p_message: `₹${split.amount} received for ${expense.description}`,
      p_data: { expense_id: expenseId, group_id: expense.group_id },
      p_action_url: `/group-expenses/${expense.group_id}`,
    })

    return NextResponse.json({ success: true, message: "Expense settled" })
  } catch (error) {
    console.error("Error in settle POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
