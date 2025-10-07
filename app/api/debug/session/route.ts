import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession, getSessionData } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    const sessionCookie = cookieStore.get("expense_tracker_session")
    const userId = await getSession()
    const sessionData = await getSessionData()

    return NextResponse.json({
      success: true,
      data: {
        hasCookie: !!sessionCookie,
        cookieValue: sessionCookie?.value ? "***" + sessionCookie.value.slice(-10) : null,
        userId: userId || null,
        sessionData: sessionData ? {
          userId: sessionData.userId,
          expiresAt: new Date(sessionData.expiresAt).toISOString(),
          isExpired: Date.now() > sessionData.expiresAt
        } : null,
        allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
