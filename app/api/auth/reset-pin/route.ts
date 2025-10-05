import { type NextRequest, NextResponse } from "next/server"
import { resetUserPin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, credential, newPin } = await request.json()

    if (!username || username.length < 3 || username.length > 50) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    if (!credential || credential.length !== 8) {
      return NextResponse.json({ success: false, error: "Invalid credential format" }, { status: 400 })
    }

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ success: false, error: "PIN must be exactly 4 digits" }, { status: 400 })
    }

    const result = await resetUserPin(username, credential, newPin)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
