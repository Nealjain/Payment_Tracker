import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { sanitizeInput } from "@/lib/api-security"

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const phoneNumber = sanitizeInput(body.phoneNumber, 20)

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if phone is already taken
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", phoneNumber)
      .neq("id", userId)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: "Phone number already in use" }, { status: 400 })
    }

    // Update phone
    const { error } = await supabase
      .from("users")
      .update({ phone_number: phoneNumber, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating phone:", error)
      return NextResponse.json({ success: false, error: "Failed to update phone number" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-phone:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
