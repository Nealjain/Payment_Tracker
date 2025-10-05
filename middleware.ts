import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth", "/auth/forgot-pin", "/onboarding"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // API routes handle their own authentication
  const isApiRoute = pathname.startsWith("/api/")

  if (isPublicRoute || isApiRoute) {
    return NextResponse.next()
  }

  // Check session for protected routes
  const sessionResult = await validateSession()

  if (!sessionResult.valid) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
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
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
