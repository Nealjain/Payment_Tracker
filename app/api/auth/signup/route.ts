import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session"
import { hashPin } from "@/lib/auth"
import { signupSchema } from "@/lib/schemas/auth"
import { successResponse, errorResponse, validationErrorResponse, rateLimitResponse, serverErrorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { email, password, username, phoneNumber, pin } = validation.data

    const supabase = await createClient()

    // Check if email, username, or phone already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email, username, phone_number")
      .or(`email.eq.${email},username.eq.${username},phone_number.eq.${phoneNumber}`)
      .single()

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse("Email already exists", 400, "EMAIL_EXISTS")
      }
      if (existingUser.username === username) {
        return errorResponse("Username already exists", 400, "USERNAME_EXISTS")
      }
      if (existingUser.phone_number === phoneNumber) {
        return errorResponse("Phone number already exists", 400, "PHONE_EXISTS")
      }
    }

    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
        options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/complete-profile`,
        data: {
          username,
          phone_number: phoneNumber,
        },
      },
    })

    if (authError) {
      // Handle rate limit error specifically
      if (authError.message.includes("For security purposes")) {
        return rateLimitResponse("Please wait a moment before trying again")
      }
      return errorResponse(authError.message, 400, "AUTH_ERROR")
    }

    if (!authData.user) {
      return serverErrorResponse("Failed to create user")
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
      return serverErrorResponse(`Account created but profile setup failed: ${dbError.message}`)
    }

    // Create session token and attach cookie to response
    const token = await createSession(authData.user.id, { setCookie: false })
    const res = successResponse({ userId: authData.user.id }, 201)
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return res
  } catch (error) {
    console.error("Signup error:", error)
    return serverErrorResponse("Internal server error")
  }
}
