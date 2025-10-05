import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, pin_hash, phone_number")
        .eq("id", data.user.id)
        .single()

      if (!existingUser) {
        // New Google user - redirect to complete profile (PIN + phone setup)
        // Store user ID in session temporarily
        await createSession(data.user.id)
        return NextResponse.redirect(new URL("/auth/complete-profile", requestUrl.origin))
      }

      // Check if user has PIN and phone number
      if (!existingUser.pin_hash || !existingUser.phone_number) {
        // Existing user but missing PIN or phone - redirect to complete profile
        await createSession(data.user.id)
        return NextResponse.redirect(new URL("/auth/complete-profile", requestUrl.origin))
      }

      // User has complete profile - create session and redirect to dashboard
      await createSession(data.user.id)
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
    }
  }

  // If there's an error, redirect to auth page
  return NextResponse.redirect(new URL("/auth", requestUrl.origin))
}
