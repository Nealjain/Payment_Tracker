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

    // Verify the split belongs to the user
    const { data: split, error: splitError } = await supabase
      .from("group_expense_splits")
      .select("*, group_expenses(group_id)")
      .eq("id", splitId)
      .eq("user_id", userId)
      .single()

    if (splitError || !split) {
      return NextResponse.json({ success: false, error: "Split not found" }, { status: 404 })
    }

    // Update split to mark payment as requested
    const { error: updateError } = await supabase
      .from("group_expense_splits")
      .update({
        payment_requested_at: new Date().toISOString(),
        payment_approved: false,
        payment_rejected: false,
      })
      .eq("id", splitId)

    if (updateError) {
      console.error("Error requesting approval:", updateError)
      return NextResponse.json({ success: false, error: "Failed to request approval" }, { status: 500 })
    }

    // TODO: Send notification to payer

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in request-approval:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
