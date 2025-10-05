import { type NextRequest, NextResponse } from "next/server"
import { createPayment, getPayments } from "@/lib/payments"
import { withAuth, withRateLimit, validateRequestBody, sanitizeInput } from "@/lib/api-security"

async function handleGetPayments(request: NextRequest, userId: string) {
  try {
    const result = await getPayments(userId)

    if (result.success) {
      return NextResponse.json({ success: true, payments: result.payments })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function handleCreatePayment(request: NextRequest, userId: string) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateRequestBody(body, ["amount", "type", "direction", "date"])
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // Sanitize and validate inputs
    const amount = Number.parseFloat(body.amount)
    const type = sanitizeInput(body.type, 10)
    const direction = sanitizeInput(body.direction, 10)
    const description = sanitizeInput(body.description || "", 500)
    const category = sanitizeInput(body.category || "", 100)
    const date = sanitizeInput(body.date, 10)

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be a positive number" }, { status: 400 })
    }

    if (!["cash", "online"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid payment type" }, { status: 400 })
    }

    if (!["incoming", "outgoing"].includes(direction)) {
      return NextResponse.json({ success: false, error: "Invalid payment direction" }, { status: 400 })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 })
    }

    const paymentData = {
      amount,
      type: type as "cash" | "online",
      direction: direction as "incoming" | "outgoing",
      description: description || undefined,
      category: category || undefined,
      date,
    }

    const result = await createPayment(userId, paymentData)

    if (result.success) {
      return NextResponse.json({ success: true, payment: result.payment })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, (req) => withAuth(req, handleGetPayments))
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, (req) => withAuth(req, handleCreatePayment))
}
