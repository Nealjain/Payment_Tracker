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
    const username = sanitizeInput(body.username, 50)

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if username is already taken
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", userId)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: "Username already taken" }, { status: 400 })
    }

    // Update username
    const { error } = await supabase
      .from("users")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating username:", error)
      return NextResponse.json({ success: false, error: "Failed to update username" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-username:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
