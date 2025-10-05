import { type NextRequest, NextResponse } from "next/server"
import { getPaymentStats } from "@/lib/payments"
import { withAuth, withRateLimit } from "@/lib/api-security"

async function handleGetStats(request: NextRequest, userId: string) {
  try {
    const result = await getPaymentStats(userId)

    if (result.success) {
      return NextResponse.json({ success: true, stats: result.stats })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, (req) => withAuth(req, handleGetStats))
}
