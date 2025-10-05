import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"
import { verifyPin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, pin, loginMethod } = await request.json()

    if (!identifier) {
      return NextResponse.json({ success: false, error: "Email or username is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if identifier is email or username
    const isEmail = identifier.includes("@")

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, username, pin_hash")
      .or(isEmail ? `email.eq.${identifier}` : `username.eq.${identifier}`)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid email/username or credentials" },
        { status: 401 }
      )
    }

    if (loginMethod === "password") {
      // Password-based login
      if (!password) {
        return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 })
      }

      // Authenticate with Supabase Auth using email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      })

      if (authError || !authData.user) {
        return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
      }

      // Create session
      await createSession(user.id)

      return NextResponse.json({ success: true, userId: user.id })
    } else {
      // PIN-based login
      if (!pin) {
        return NextResponse.json({ success: false, error: "PIN is required" }, { status: 400 })
      }

      // Validate PIN is 4 digits
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return NextResponse.json({ success: false, error: "PIN must be exactly 4 digits" }, { status: 400 })
      }

      // Verify PIN
      const isValidPin = await verifyPin(pin, user.pin_hash)
      if (!isValidPin) {
        return NextResponse.json({ success: false, error: "Invalid PIN" }, { status: 401 })
      }

      // PIN is valid - create session
      await createSession(user.id)

      return NextResponse.json({ success: true, userId: user.id })
    }
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
