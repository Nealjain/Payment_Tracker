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
        // New user - Store OAuth data and SIGN OUT from Supabase Auth
        // User will only be authenticated after completing profile
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

        cookieStore.set("pending_oauth_user_id", session.user.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
        })

        // IMPORTANT: Sign out from Supabase Auth immediately
        // User will be signed in again after completing profile
        await supabase.auth.signOut()

        // Redirect to complete profile WITHOUT authentication
          const redirectUrl = new URL("/auth/complete-profile", requestUrl.origin)
          const res = NextResponse.redirect(redirectUrl)

          // Store pending OAuth data temporarily (expires in 10 minutes)
          res.cookies.set("pending_oauth_email", session.user.email!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 10, // 10 minutes to complete profile
            path: "/",
          })

          res.cookies.set("pending_oauth_provider", "google", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 10,
            path: "/",
          })

          return res
      } else {
        // User exists - update provider to include google if not already
        if (existingUser.provider !== "google") {
          await supabase
            .from("users")
            .update({ provider: "google" })
            .eq("id", existingUser.id)
        }

        // Set session cookie
          // Set session cookie using JWT from createSession and attach it to redirect response
          const sessionToken = await (await import("@/lib/session")).createSession(existingUser.id, { setCookie: false })

          // Build redirect response and attach session cookie so client receives it on redirect
          // Default redirect is dashboard; may change below if profile incomplete or onboarding needed
          let destination = 
            `${requestUrl.origin}/dashboard`

          // Check if profile is complete
          const isProfileComplete = 
            existingUser.username && 
            !existingUser.username.startsWith("temp_") &&
            existingUser.phone_number && 
            existingUser.pin_hash && 
            existingUser.pin_hash !== "temp"

          if (!isProfileComplete) {
            destination = `${requestUrl.origin}/auth/complete-profile`
          } else {
            // Profile is complete - check onboarding
            const { data: preferences } = await supabase
              .from("user_preferences")
              .select("onboarding_completed")
              .eq("user_id", existingUser.id)
              .single()

            if (!preferences?.onboarding_completed) {
              destination = `${requestUrl.origin}/onboarding`
            }
          }

          const redirectUrl = new URL(destination)
          const res = NextResponse.redirect(redirectUrl)

          // Attach session cookie
          res.cookies.set("expense_tracker_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          })

          return res
      }
    }
  }

  // No code or session - redirect to auth
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
