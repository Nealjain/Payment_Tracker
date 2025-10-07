import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const pendingEmail = cookieStore.get("pending_oauth_email")?.value
    const pendingProvider = cookieStore.get("pending_oauth_provider")?.value

    if (pendingEmail && pendingProvider) {
      return successResponse({
        email: pendingEmail,
        provider: pendingProvider,
      })
    }

    return errorResponse("No pending OAuth session", 404, "NO_PENDING_OAUTH")
  } catch (error) {
    console.error("Pending OAuth check error:", error)
    return errorResponse("Internal server error", 500)
  }
}
