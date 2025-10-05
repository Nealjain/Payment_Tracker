import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { sanitizeInput } from "@/lib/api-security"

// PUT - Update UPI ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const upiId = body.upi_id ? sanitizeInput(body.upi_id, 100) : undefined
    const name = body.name ? sanitizeInput(body.name, 100) : undefined
    const bankName = body.bank_name !== undefined ? sanitizeInput(body.bank_name, 100) : undefined
    const isPrimary = body.is_primary
    const isActive = body.is_active

    if (upiId) {
      const upiRegex = /^[\w.-]+@[\w.-]+$/
      if (!upiRegex.test(upiId)) {
        return NextResponse.json({ success: false, error: "Invalid UPI ID format" }, { status: 400 })
      }
    }

    const supabase = await createClient()

    const updateData: any = { updated_at: new Date().toISOString() }
    if (upiId) updateData.upi_id = upiId
    if (name) updateData.name = name
    if (bankName !== undefined) updateData.bank_name = bankName || null
    if (isPrimary !== undefined) updateData.is_primary = isPrimary
    if (isActive !== undefined) updateData.is_active = isActive

    const { data, error } = await supabase
      .from("upi_ids")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating UPI ID:", error)
      return NextResponse.json({ success: false, error: "Failed to update UPI ID" }, { status: 500 })
    }

    return NextResponse.json({ success: true, upiId: data })
  } catch (error) {
    console.error("Error in UPI PUT:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete UPI ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("upi_ids")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId)

    if (error) {
      console.error("Error deleting UPI ID:", error)
      return NextResponse.json({ success: false, error: "Failed to delete UPI ID" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in UPI DELETE:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
