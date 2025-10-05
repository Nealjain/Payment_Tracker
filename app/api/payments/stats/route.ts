import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPaymentStats } from "@/lib/payments"

export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await getPaymentStats(userId)

    if (result.success) {
      return NextResponse.json({ success: true, stats: result.stats })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
