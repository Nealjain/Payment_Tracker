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
    const email = sanitizeInput(body.email, 100)

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if email is already taken
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", userId)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
    }

    // Update email
    const { error } = await supabase
      .from("users")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating email:", error)
      return NextResponse.json({ success: false, error: "Failed to update email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-email:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
