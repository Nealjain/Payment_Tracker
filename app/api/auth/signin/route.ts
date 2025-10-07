import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"
import { verifyPin } from "@/lib/auth"
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔐 Signin attempt:", { 
      hasEmail: !!body.email, 
      hasUsername: !!body.username, 
      hasPhoneNumber: !!body.phoneNumber,
      hasPassword: !!body.password,
      hasPin: !!body.pin 
    })

    // Accept either email/username/phoneNumber and either password or pin
    const { email, username, phoneNumber, password, pin } = body as {
      email?: string
      username?: string
      phoneNumber?: string
      password?: string
      pin?: string
    }

    const supabase = await createClient()

    // Find user by email, username, or phone
    let userQuery = supabase.from("users").select("id, email, username, phone_number, pin_hash")

    if (email) userQuery = userQuery.eq("email", email)
    else if (username) userQuery = userQuery.eq("username", username)
    else if (phoneNumber) userQuery = userQuery.eq("phone_number", phoneNumber)
    else return unauthorizedResponse("No identifier provided")

    const { data: user, error: userError } = await userQuery.single()

    if (userError || !user) {
      console.log("❌ User not found:", userError?.message)
      return unauthorizedResponse("User not found")
    }

    console.log("✅ User found:", { id: user.id, email: user.email, username: user.username })

    // If password provided, authenticate via Supabase Auth using email
    if (password) {
      if (!user.email) return unauthorizedResponse("No email on account for password login")

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      })

      if (authError || !authData.user) {
        console.log("❌ Password authentication failed:", authError?.message)
        return unauthorizedResponse("Invalid password")
      }

      console.log("✅ Password authentication successful")
      await createSession(user.id)
      return successResponse({ userId: user.id })
    }

    // If PIN provided, verify locally
    if (pin) {
      console.log("🔢 Verifying PIN...")
      const isValidPin = await verifyPin(pin, user.pin_hash)
      if (!isValidPin) {
        console.log("❌ PIN verification failed")
        return unauthorizedResponse("Invalid PIN")
      }
      console.log("✅ PIN verification successful")
      await createSession(user.id)
      return successResponse({ userId: user.id })
    }

    return unauthorizedResponse("No credentials provided")
  } catch (error) {
    console.error("Signin error:", error)
    return serverErrorResponse("Internal server error")
  }
}
