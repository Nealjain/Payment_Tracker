import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export interface SessionData {
  userId: string
  createdAt: number
  expiresAt: number
}

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const SESSION_COOKIE_NAME = "expense_tracker_session"
const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production"
export const SESSION_COOKIE = SESSION_COOKIE_NAME
export const SESSION_MAX_AGE = SESSION_DURATION / 1000

export async function createSession(
  userId: string,
  options?: { setCookie?: boolean }
): Promise<string> {
  const sessionData: SessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  // Sign JWT token
  const sessionToken = jwt.sign(sessionData, JWT_SECRET, {
    expiresIn: "24h",
  })

  const setCookie = options?.setCookie ?? true

  if (setCookie) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    })
    console.log("🍪 Session cookie set with sameSite: lax")
  }

  return sessionToken
}

export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Verify JWT token
    const sessionData = jwt.verify(sessionToken, JWT_SECRET) as SessionData

    if (Date.now() > sessionData.expiresAt) {
      await clearSession()
      return null
    }

    return sessionData.userId
  } catch (error) {
    await clearSession()
    return null
  }
}

export async function getSessionData(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Verify JWT token
    const sessionData = jwt.verify(sessionToken, JWT_SECRET) as SessionData

    if (Date.now() > sessionData.expiresAt) {
      await clearSession()
      return null
    }

    return sessionData
  } catch (error) {
    await clearSession()
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function validateSession(): Promise<{ valid: boolean; userId?: string; error?: string }> {
  console.log("🔍 validateSession: Checking for session...")
  const userId = await getSession()

  if (!userId) {
    console.log("❌ validateSession: No session found")
    return { valid: false, error: "No active session" }
  }

  console.log("✅ validateSession: Session found for user:", userId)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("id").eq("id", userId).single()

    if (error || !data) {
      console.log("❌ validateSession: User not found in database")
      await clearSession()
      return { valid: false, error: "Invalid session" }
    }

    console.log("✅ validateSession: User validated")
    return { valid: true, userId: userId }
  } catch (error) {
    console.log("❌ validateSession: Validation failed:", error)
    await clearSession()
    return { valid: false, error: "Session validation failed" }
  }
}
