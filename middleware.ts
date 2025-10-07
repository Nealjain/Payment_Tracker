import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

const publicRoutes = ["/auth", "/auth/callback"]
const profileRoutes = ["/auth/complete-profile"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Not authenticated - redirect to auth
    const url = new URL("/auth", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // User is authenticated - check if profile is complete
  const { data: user } = await supabase
    .from("users")
    .select("username, phone_number, pin_hash")
    .eq("email", session.user.email)
    .single()

  const isProfileComplete = user && 
    user.username && 
    !user.username.startsWith("temp_") &&
    user.phone_number && 
    user.pin_hash && 
    user.pin_hash !== "temp"

  // If profile is not complete and not on profile completion page
  if (!isProfileComplete && !profileRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/complete-profile", request.url))
  }

  // If profile is complete and on profile completion page, redirect to dashboard
  if (isProfileComplete && profileRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
}
