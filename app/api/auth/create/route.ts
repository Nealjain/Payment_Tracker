import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session"
import { withRateLimit, validateRequestBody, sanitizeInput } from "@/lib/api-security"

async function handleCreateUser(request: NextRequest) {
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

    const result = await createUser(username, pin)

    if (result.success && result.userId) {
      // Create session token and attach cookie
      const token = await createSession(result.userId, { setCookie: false })
      const res = NextResponse.json({ success: true, userId: result.userId })
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      })

      return res
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleCreateUser, 3, 15 * 60 * 1000) // 3 attempts per 15 minutes
}
