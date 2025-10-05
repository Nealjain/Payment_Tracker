import { type NextRequest, NextResponse } from "next/server"
import { updatePayment, deletePayment } from "@/lib/payments"
import { withAuth, withRateLimit, validateRequestBody, sanitizeInput } from "@/lib/api-security"

async function handleUpdatePayment(request: NextRequest, userId: string, paymentId: string) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateRequestBody(body, ["amount", "type", "direction", "date"])
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // Sanitize and validate inputs (same as create)
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
      type: type as "income" | "expense",
      direction: direction as "in" | "out",
      description: description || undefined,
      category: category || undefined,
      date,
    }

    const result = await updatePayment(userId, paymentId, paymentData)

    if (result.success) {
      return NextResponse.json({ success: true, payment: result.payment })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Update payment error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function handleDeletePayment(request: NextRequest, userId: string, paymentId: string) {
  try {
    const result = await deletePayment(userId, paymentId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete payment error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withRateLimit(request, (req) => withAuth(req, (req, userId) => handleUpdatePayment(req, userId, id)))
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withRateLimit(request, (req) => withAuth(req, (req, userId) => handleDeletePayment(req, userId, id)))
}
