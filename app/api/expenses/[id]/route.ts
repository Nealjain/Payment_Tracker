import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// DELETE - Delete an expense (only by creator)
export async function DELETE(
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

    // Check if user is the one who paid (creator of expense)
    const { data: expense, error: expenseError } = await supabase
      .from("group_expenses")
      .select("paid_by")
      .eq("id", expenseId)
      .single()

    if (expenseError || !expense) {
      return NextResponse.json({ success: false, error: "Expense not found" }, { status: 404 })
    }

    if (expense.paid_by !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Only the person who created the expense can delete it" 
      }, { status: 403 })
    }

    // Delete expense (splits will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from("group_expenses")
      .delete()
      .eq("id", expenseId)

    if (deleteError) {
      console.error("Error deleting expense:", deleteError)
      return NextResponse.json({ success: false, error: "Failed to delete expense" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Expense deleted" })
  } catch (error) {
    console.error("Error in expense DELETE:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
