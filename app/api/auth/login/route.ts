import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { createSession } from "@/lib/session"
import { withRateLimit, validateRequestBody, sanitizeInput } from "@/lib/api-security"

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateRequestBody(body, ["username", "pin"])
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const username = sanitizeInput(body.username, 50)
    const pin = sanitizeInput(body.pin, 4)

    if (!username || username.length < 3 || username.length > 50) {
      return NextResponse.json({ success: false, error: "Username must be 3-50 characters" }, { status: 400 })
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, error: "PIN must be exactly 4 digits" }, { status: 400 })
    }

    const result = await authenticateUser(username, pin)

    if (result.success && result.userId) {
      // Create session
      await createSession(result.userId)

      return NextResponse.json({ success: true, userId: result.userId })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleLogin, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes
}
