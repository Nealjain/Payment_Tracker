import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const splitId = params.id
    const supabase = await createClient()

    // Get the split and verify the user is the payer
    const { data: split, error: splitError } = await supabase
      .from("group_expense_splits")
      .select("*, group_expenses(paid_by, group_id)")
      .eq("id", splitId)
      .single()

    if (splitError || !split) {
      return NextResponse.json({ success: false, error: "Split not found" }, { status: 404 })
    }

    if (split.group_expenses.paid_by !== userId) {
      return NextResponse.json({ success: false, error: "Only the payer can approve payments" }, { status: 403 })
    }

    // Approve and settle the payment
    const { error: updateError } = await supabase
      .from("group_expense_splits")
      .update({
        payment_approved: true,
        payment_approved_at: new Date().toISOString(),
        is_settled: true,
        settled_at: new Date().toISOString(),
      })
      .eq("id", splitId)

    if (updateError) {
      console.error("Error approving payment:", updateError)
      return NextResponse.json({ success: false, error: "Failed to approve payment" }, { status: 500 })
    }

    // TODO: Send notification to the member

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in approve payment:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
