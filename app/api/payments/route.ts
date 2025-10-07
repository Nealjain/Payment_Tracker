import { type NextRequest } from "next/server"
import { createPayment, getPayments } from "@/lib/payments"
import { withAuth, withRateLimit } from "@/lib/api-security"
import { paymentSchema } from "@/lib/schemas/payment"
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from "@/lib/api-response"

async function handleGetPayments(request: NextRequest, userId: string) {
  try {
    const result = await getPayments(userId)

    if (result.success) {
      return successResponse({ payments: result.payments })
    } else {
      return errorResponse(result.error || "Failed to fetch payments")
    }
  } catch (error) {
    console.error("Get payments error:", error)
    return serverErrorResponse("Internal server error")
  }
}

async function handleCreatePayment(request: NextRequest, userId: string) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validation = paymentSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { amount, type, description, category, date, paymentMethod } = validation.data

    const paymentData = {
      amount,
      type,
      direction: type === "income" ? ("in" as const) : ("out" as const),
      description,
      category,
      date,
      payment_method: paymentMethod,
    }

    const result = await createPayment(userId, paymentData)

    if (result.success) {
      return successResponse({ payment: result.payment }, 201)
    } else {
      return errorResponse(result.error || "Failed to create payment")
    }
  } catch (error) {
    console.error("Create payment error:", error)
    return serverErrorResponse("Internal server error")
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, (req) => withAuth(req, handleGetPayments))
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, (req) => withAuth(req, handleCreatePayment))
}
