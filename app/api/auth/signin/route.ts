import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"
import { verifyPin } from "@/lib/auth"
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response"
import { signinSchema } from "@/lib/schemas/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input shape
    const validation = signinSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { email, username, phoneNumber, password, pin } = validation.data

    const supabase = await createClient()

    // Find user by email, username, or phone
    let userQuery = supabase.from("users").select("id, email, username, phone_number, pin_hash")

    if (email) userQuery = userQuery.eq("email", email)
    else if (username) userQuery = userQuery.eq("username", username)
    else if (phoneNumber) userQuery = userQuery.eq("phone_number", phoneNumber)
    else return unauthorizedResponse("No identifier provided")

    const { data: user, error: userError } = await userQuery.single()

    if (userError || !user) {
      return unauthorizedResponse("User not found")
    }

    // If password provided, authenticate via Supabase Auth using email
    if (password) {
      if (!user.email) return unauthorizedResponse("No email on account for password login")

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      })

      if (authError || !authData.user) {
        return unauthorizedResponse("Invalid password")
      }

      await createSession(user.id)
      return successResponse({ userId: user.id })
    }

    // If PIN provided, verify locally
    if (pin) {
      const isValidPin = await verifyPin(pin, user.pin_hash)
      if (!isValidPin) {
        return unauthorizedResponse("Invalid PIN")
      }

      await createSession(user.id)
      return successResponse({ userId: user.id })
    }

    return unauthorizedResponse("No credentials provided")
  } catch (error) {
    console.error("Signin error:", error)
    return serverErrorResponse("Internal server error")
  }
}
