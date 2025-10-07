import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=oauth_failed`)
    }

    if (session) {
      // Check if user exists in our users table (by email - merge Google and email accounts)
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, username, phone_number, pin_hash, provider")
        .eq("email", session.user.email)
        .single()

      if (!existingUser) {
        // New user - DO NOT create account yet
        // Store email in a temporary session and redirect to complete profile
        // The complete-profile page will create the actual user record
        const cookieStore = await cookies()
        
        // Store pending OAuth data temporarily (expires in 10 minutes)
        cookieStore.set("pending_oauth_email", session.user.email!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10, // 10 minutes to complete profile
        })
        
        cookieStore.set("pending_oauth_provider", "google", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
        })

        // Redirect to complete profile WITHOUT creating user yet
        return NextResponse.redirect(`${requestUrl.origin}/auth/complete-profile`)
      } else {
        // User exists - update provider to include google if not already
        if (existingUser.provider !== "google") {
          await supabase
            .from("users")
            .update({ provider: "google" })
            .eq("id", existingUser.id)
        }

        // Set session cookie
        const cookieStore = await cookies()
        cookieStore.set("session", existingUser.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        })

        // Check if profile is complete
        const isProfileComplete = 
          existingUser.username && 
          !existingUser.username.startsWith("temp_") &&
          existingUser.phone_number && 
          existingUser.pin_hash && 
          existingUser.pin_hash !== "temp"

        if (!isProfileComplete) {
          // Incomplete profile - redirect to complete it
          return NextResponse.redirect(`${requestUrl.origin}/auth/complete-profile`)
        }

        // Profile is complete - check onboarding
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("onboarding_completed")
          .eq("user_id", existingUser.id)
          .single()

        if (!preferences?.onboarding_completed) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }

        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    }
  }

  // No code or session - redirect to auth
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
