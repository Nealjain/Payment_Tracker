import { NextRequest, NextResponse } from "next/server"

// Google OAuth has been disabled per project settings.
// Any incoming OAuth callback will be redirected back to the auth page.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  // Redirect to /auth and include a flag for the UI to show a message if desired
  return NextResponse.redirect(`${requestUrl.origin}/auth?oauth_disabled=1`)
}
