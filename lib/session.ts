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

export async function createSession(userId: string): Promise<string> {
  const sessionData: SessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  // Sign JWT token
  const sessionToken = jwt.sign(sessionData, JWT_SECRET, {
    expiresIn: "24h",
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

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
  const userId = await getSession()

  if (!userId) {
    return { valid: false, error: "No active session" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("id").eq("id", userId).single()

    if (error || !data) {
      await clearSession()
      return { valid: false, error: "Invalid session" }
    }

    return { valid: true, userId: userId }
  } catch (error) {
    await clearSession()
    return { valid: false, error: "Session validation failed" }
  }
}
