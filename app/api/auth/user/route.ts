import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, phone_number, created_at")
      .eq("id", userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("User API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
