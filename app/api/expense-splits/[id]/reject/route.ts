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

    const body = await request.json()
    const reason = body.reason || "Payment not received"
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
      return NextResponse.json({ success: false, error: "Only the payer can reject payments" }, { status: 403 })
    }

    // Reject the payment request
    const { error: updateError } = await supabase
      .from("group_expense_splits")
      .update({
        payment_rejected: true,
        payment_rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        payment_requested_at: null, // Reset so they can try again
        payment_approved: false,
      })
      .eq("id", splitId)

    if (updateError) {
      console.error("Error rejecting payment:", updateError)
      return NextResponse.json({ success: false, error: "Failed to reject payment" }, { status: 500 })
    }

    // TODO: Send notification to the member

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in reject payment:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
