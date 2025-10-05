import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { hashPassword, verifyPassword } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPin, newPin } = body

    if (!currentPin || !newPin) {
      return NextResponse.json({ success: false, error: "Both PINs are required" }, { status: 400 })
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ success: false, error: "PIN must be exactly 4 digits" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current PIN hash
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Verify current PIN
    const isValid = await verifyPassword(currentPin, user.pin_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Current PIN is incorrect" }, { status: 400 })
    }

    // Hash new PIN
    const newPinHash = await hashPassword(newPin)

    // Update PIN
    const { error } = await supabase
      .from("users")
      .update({ pin_hash: newPinHash, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating PIN:", error)
      return NextResponse.json({ success: false, error: "Failed to update PIN" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-pin:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
