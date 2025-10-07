import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { validateSession } from "@/lib/session"

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  maxAttempts = 10,
  windowMs: number = 60 * 1000,
) {
  const clientIP = getClientIP(request)
  const rateLimitResult = rateLimit(clientIP, maxAttempts, windowMs)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: rateLimitResult.error,
        retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000),
      },
      { status: 429 },
    )
  }

  const response = await handler(request)

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", maxAttempts.toString())
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())

  return response
}

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>,
) {
  console.log("🔐 withAuth: Validating session...")
  const sessionResult = await validateSession()

  if (!sessionResult.valid) {
    console.log("❌ withAuth: Session invalid:", sessionResult.error)
    return NextResponse.json(
      { success: false, error: sessionResult.error || "Authentication required" },
      { status: 401 },
    )
  }

  console.log("✅ withAuth: Session valid for user:", sessionResult.userId)
  return handler(request, sessionResult.userId!)
}

export function validateRequestBody(body: any, requiredFields: string[]): { valid: boolean; error?: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" }
  }

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }

  return { valid: true }
}

export function sanitizeInput(input: string, maxLength = 1000): string {
  if (typeof input !== "string") {
    return ""
  }

  return input.trim().slice(0, maxLength)
}
