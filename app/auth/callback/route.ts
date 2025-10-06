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
        // New user - create minimal record and redirect to complete profile
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            email: session.user.email,
            username: session.user.email?.split("@")[0] || `user_${Date.now()}`,
            pin_hash: "temp", // Temporary, will be updated in complete profile
            provider: "google",
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating user:", createError)
          // User might already exist, try to fetch again
          const { data: retryUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single()

          if (retryUser) {
            const cookieStore = await cookies()
            cookieStore.set("session", retryUser.id, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
            })
            return NextResponse.redirect(`${requestUrl.origin}/auth/complete-profile`)
          }

          return NextResponse.redirect(`${requestUrl.origin}/auth?error=user_creation_failed`)
        }

        // Set session cookie
        const cookieStore = await cookies()
        cookieStore.set("session", newUser.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        // Redirect to complete profile
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
        const isProfileComplete = existingUser.username && 
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
