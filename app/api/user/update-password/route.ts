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
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Both passwords are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "New password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current password hash
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Verify current password (stored in pin_hash field for now)
    const isValid = await verifyPassword(currentPassword, user.pin_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    const { error } = await supabase
      .from("users")
      .update({ pin_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating password:", error)
      return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-password:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
