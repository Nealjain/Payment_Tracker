// Simple in-memory rate limiting (in production, use Redis or similar)
const attempts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now()
  const key = identifier
  const record = attempts.get(key)

  if (!record || now > record.resetTime) {
    attempts.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxAttempts - 1 }
  }

  if (record.count >= maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      error: "Too many attempts. Please try again later.",
    }
  }

  record.count++
  attempts.set(key, record)

  return { success: true, remaining: maxAttempts - record.count }
}

export function clearRateLimit(identifier: string) {
  attempts.delete(identifier)
}
