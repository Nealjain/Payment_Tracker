import { NextResponse } from "next/server"
import { ZodError } from "zod"

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

export function errorResponse(error: string, status = 400, code?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status }
  )
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  const firstError = error.errors[0]
  return errorResponse(
    firstError?.message || "Validation failed",
    400,
    "VALIDATION_ERROR"
  )
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse<ApiResponse> {
  return errorResponse(message, 401, "UNAUTHORIZED")
}

export function forbiddenResponse(message = "Forbidden"): NextResponse<ApiResponse> {
  return errorResponse(message, 403, "FORBIDDEN")
}

export function notFoundResponse(message = "Not found"): NextResponse<ApiResponse> {
  return errorResponse(message, 404, "NOT_FOUND")
}

export function serverErrorResponse(message = "Internal server error"): NextResponse<ApiResponse> {
  return errorResponse(message, 500, "SERVER_ERROR")
}

export function rateLimitResponse(message = "Too many requests"): NextResponse<ApiResponse> {
  return errorResponse(message, 429, "RATE_LIMIT")
}
