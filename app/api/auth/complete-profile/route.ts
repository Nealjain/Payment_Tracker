import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"
import { hashPin } from "@/lib/auth"
import { completeProfileSchema } from "@/lib/schemas/auth"
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validation = completeProfileSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { username, phoneNumber, pin } = validation.data

    // Get pending OAuth data from cookies
    const cookieStore = await cookies()
    const pendingEmail = cookieStore.get("pending_oauth_email")?.value
    const pendingProvider = cookieStore.get("pending_oauth_provider")?.value
    const pendingUserId = cookieStore.get("pending_oauth_user_id")?.value

    if (!pendingEmail || !pendingProvider || !pendingUserId) {
      return unauthorizedResponse("No pending OAuth session found. Please sign in again.")
    }

    const supabase = await createClient()

    // Check if username or phone already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("username, phone_number")
      .or(`username.eq.${username},phone_number.eq.${phoneNumber}`)
      .single()

    if (existingUser) {
      if (existingUser.username === username) {
        return errorResponse("Username already exists", 400, "USERNAME_EXISTS")
      }
      if (existingUser.phone_number === phoneNumber) {
        return errorResponse("Phone number already exists", 400, "PHONE_EXISTS")
      }
    }

    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Create user record in users table using the stored user ID
    const { data: newUser, error: dbError } = await supabase
      .from("users")
      .insert({
        id: pendingUserId,
        email: pendingEmail,
        username,
        phone_number: phoneNumber,
        pin_hash: pinHash,
        provider: pendingProvider,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      return serverErrorResponse(`Failed to create profile: ${dbError.message}`)
    }

    // Clear pending OAuth cookies
    cookieStore.delete("pending_oauth_email")
    cookieStore.delete("pending_oauth_provider")
    cookieStore.delete("pending_oauth_user_id")

    // Create session
    await createSession(newUser.id)

    return successResponse({ userId: newUser.id }, 201)
  } catch (error) {
    console.error("Complete profile error:", error)
    return serverErrorResponse("Internal server error")
  }
}
