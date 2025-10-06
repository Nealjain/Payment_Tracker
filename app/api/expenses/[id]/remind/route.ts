import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// POST - Send reminder to members who haven't paid
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

    // Get expense details
    const { data: expense, error: expenseError } = await supabase
      .from("group_expenses")
      .select(`
        *,
        paid_by_user:users!group_expenses_paid_by_fkey(username),
        group:groups(name),
        splits:group_expense_splits(
          *,
          user:users(username)
        )
      `)
      .eq("id", expenseId)
      .single()

    if (expenseError || !expense) {
      return NextResponse.json({ success: false, error: "Expense not found" }, { status: 404 })
    }

    // Check if user is the one who paid
    if (expense.paid_by !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Only the person who paid can send reminders" 
      }, { status: 403 })
    }

    // Get unsettled splits
    const unsettledSplits = expense.splits.filter((split: any) => !split.is_settled)

    if (unsettledSplits.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "All members have already paid" 
      }, { status: 400 })
    }

    // Send notification to each unsettled member
    for (const split of unsettledSplits) {
      const dueText = split.due_date 
        ? ` (Due: ${new Date(split.due_date).toLocaleDateString()})` 
        : ""
      
      await supabase.rpc("create_notification", {
        p_user_id: split.user_id,
        p_type: "payment_request",
        p_title: "Payment Reminder",
        p_message: `Reminder: ${expense.description} - ₹${split.amount} in ${expense.group?.name}${dueText}`,
        p_data: { 
          expense_id: expenseId, 
          group_id: expense.group_id,
          amount: split.amount,
          due_date: split.due_date
        },
        p_action_url: `/group-expenses/${expense.group_id}`,
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Reminder sent to ${unsettledSplits.length} member(s)` 
    })
  } catch (error) {
    console.error("Error in remind POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
