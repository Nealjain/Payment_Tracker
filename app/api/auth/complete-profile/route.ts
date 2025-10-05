import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPin } from "@/lib/auth"
import { getSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { username, phoneNumber, pin } = await request.json()

    // Validate all required fields
    if (!username || !phoneNumber || !pin) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Validate PIN is 4 digits
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, error: "PIN must be exactly 4 digits" }, { status: 400 })
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 })
    }

    // Get current user from session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get user's email from Supabase Auth
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if username or phone already exists (for other users)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, username, phone_number")
      .or(`username.eq.${username},phone_number.eq.${phoneNumber}`)
      .neq("id", session.userId)
      .single()

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 })
      }
      if (existingUser.phone_number === phoneNumber) {
        return NextResponse.json({ success: false, error: "Phone number already exists" }, { status: 400 })
      }
    }

    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Check if user record exists
    const { data: userRecord } = await supabase.from("users").select("id").eq("id", session.userId).single()

    if (userRecord) {
      // Update existing user record
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username,
          phone_number: phoneNumber,
          pin_hash: pinHash,
        })
        .eq("id", session.userId)

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    } else {
      // Create new user record
      const { error: insertError } = await supabase.from("users").insert({
        id: session.userId,
        username,
        email: authUser.email,
        phone_number: phoneNumber,
        pin_hash: pinHash,
        provider: "google",
      })

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete profile error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
