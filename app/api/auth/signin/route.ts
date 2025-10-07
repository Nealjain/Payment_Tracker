import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"
import { verifyPin } from "@/lib/auth"
import { signinSchema } from "@/lib/schemas/auth"
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validation = signinSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { identifier, password, pin, loginMethod } = validation.data

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
      return unauthorizedResponse("Invalid email/username or credentials")
    }

    if (loginMethod === "password") {
      // Password-based login
      // Authenticate with Supabase Auth using email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password!,
      })

      if (authError || !authData.user) {
        return unauthorizedResponse("Invalid password")
      }

      // Create session
      await createSession(user.id)

      return successResponse({ userId: user.id })
    } else {
      // PIN-based login
      // Verify PIN
      const isValidPin = await verifyPin(pin!, user.pin_hash)
      if (!isValidPin) {
        return unauthorizedResponse("Invalid PIN")
      }

      // PIN is valid - create session
      await createSession(user.id)

      return successResponse({ userId: user.id })
    }
  } catch (error) {
    console.error("Signin error:", error)
    return serverErrorResponse("Internal server error")
  }
}
