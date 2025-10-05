import { type NextRequest, NextResponse } from "next/server"
import { checkUsernameAvailability } from "@/lib/auth"
import { sanitizeInput } from "@/lib/api-security"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ available: false, error: "Username is required" }, { status: 400 })
    }

    const sanitizedUsername = sanitizeInput(username, 50)

    if (!sanitizedUsername || sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
      return NextResponse.json({ available: false, error: "Username must be 3-50 characters" }, { status: 400 })
    }

    const result = await checkUsernameAvailability(sanitizedUsername)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Check username error:", error)
    return NextResponse.json({ available: false, error: "Internal server error" }, { status: 500 })
  }
}
