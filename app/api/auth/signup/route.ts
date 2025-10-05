import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"
import { hashPin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, phoneNumber, pin } = await request.json()

    // Validate all required fields
    if (!email || !password || !username || !phoneNumber || !pin) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Validate PIN is 4 digits
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, error: "PIN must be exactly 4 digits" }, { status: 400 })
    }

    // Validate phone number (basic check - component handles formatting)
    if (phoneNumber.length < 10) {
      return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if email, username, or phone already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email, username, phone_number")
      .or(`email.eq.${email},username.eq.${username},phone_number.eq.${phoneNumber}`)
      .single()

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
      }
      if (existingUser.username === username) {
        return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 })
      }
      if (existingUser.phone_number === phoneNumber) {
        return NextResponse.json({ success: false, error: "Phone number already exists" }, { status: 400 })
      }
    }

    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          username,
          phone_number: phoneNumber,
        },
      },
    })

    if (authError) {
      // Handle rate limit error specifically
      if (authError.message.includes("For security purposes")) {
        return NextResponse.json(
          { success: false, error: "Please wait a moment before trying again" },
          { status: 429 }
        )
      }
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    // Create user record in users table
    // Use a separate supabase client with service role for this operation
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      username,
      email,
      phone_number: phoneNumber,
      pin_hash: pinHash,
      provider: "email",
    })

    if (dbError) {
      console.error("Database insert error:", dbError)
      // If user was created in Auth but failed in DB, we should clean up
      // But for now, just return the error
      return NextResponse.json(
        { success: false, error: `Account created but profile setup failed: ${dbError.message}` },
        { status: 500 }
      )
    }

    // Create session
    await createSession(authData.user.id)

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
