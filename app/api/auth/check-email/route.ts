import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return errorResponse("Email is required", 400)
    }

    const supabase = await createClient()

    // Check if user exists with this email
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned (user doesn't exist)
      console.error("Check email error:", error)
      return serverErrorResponse("Failed to check email")
    }

    return successResponse({ exists: !!user })
  } catch (error) {
    console.error("Check email error:", error)
    return serverErrorResponse("Internal server error")
  }
}
