import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const publicRoutes = ["/auth"]
const SESSION_COOKIE_NAME = "expense_tracker_session"
const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated via our custom session
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      // Not authenticated - redirect to auth
      const url = new URL("/auth", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Verify JWT token
    jwt.verify(sessionToken, JWT_SECRET)
    
    // Valid session - allow request
    return NextResponse.next()
  } catch (error) {
    // Invalid session - redirect to auth
    const url = new URL("/auth", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
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
