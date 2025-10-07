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
        
        // IMPORTANT: Sign out from Supabase Auth immediately
        // This clears all Supabase auth cookies and sessions
        await supabase.auth.signOut()

        // Create redirect response with pending OAuth data
        const redirectUrl = new URL("/auth/complete-profile", requestUrl.origin)
        const res = NextResponse.redirect(redirectUrl)
        
        // Clear ALL Supabase auth cookies explicitly
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        allCookies.forEach(cookie => {
          if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
            res.cookies.delete(cookie.name)
          }
        })

        // Add cache control headers to prevent caching
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        res.headers.set("Pragma", "no-cache")
        res.headers.set("Expires", "0")

        // Store pending OAuth data in cookies (expires in 10 minutes)
        res.cookies.set("pending_oauth_email", session.user.email!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
          path: "/",
        })

        res.cookies.set("pending_oauth_provider", "google", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10,
          path: "/",
        })

        res.cookies.set("pending_oauth_user_id", session.user.id, {
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

        // Check if profile is complete
        const isProfileComplete = 
          existingUser.username && 
          !existingUser.username.startsWith("temp_") &&
          existingUser.phone_number && 
          existingUser.pin_hash && 
          existingUser.pin_hash !== "temp"

        if (!isProfileComplete) {
          // Incomplete profile - store data and redirect to complete it
          const redirectUrl = new URL("/auth/complete-profile", requestUrl.origin)
          const res = NextResponse.redirect(redirectUrl)
          
          // Add cache control headers
          res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
          
          // Store user ID for profile completion
          res.cookies.set("pending_oauth_user_id", existingUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 10,
            path: "/",
          })
          
          return res
        }

        // Profile is complete - create session
        const { createSession } = await import("@/lib/session")
        await createSession(existingUser.id)

        // Check onboarding
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("onboarding_completed")
          .eq("user_id", existingUser.id)
          .single()

        const destination = !preferences?.onboarding_completed 
          ? `${requestUrl.origin}/onboarding`
          : `${requestUrl.origin}/dashboard`

        const res = NextResponse.redirect(destination)
        
        // Add cache control headers
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
        
        return res
      }
    }
  }

  // No code or session - redirect to auth
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
