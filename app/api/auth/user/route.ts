import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    
    if (!userId) {
      return unauthorizedResponse("Not authenticated")
    }

    const supabase = await createClient()
    
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, phone_number, pin_hash, provider")
      .eq("id", userId)
      .single()

    if (error || !user) {
      return unauthorizedResponse("User not found")
    }

    // Don't send pin_hash to client, just indicate if it exists
    const { pin_hash, ...userWithoutPin } = user
    
    return successResponse({
      user: {
        ...userWithoutPin,
        hasPin: !!pin_hash && pin_hash !== "temp",
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return serverErrorResponse("Internal server error")
  }
}
