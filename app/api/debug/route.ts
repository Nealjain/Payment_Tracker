import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const hasUrl = !!process.env.SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_ANON_KEY
    const hasPublicUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasPublicKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check session
    const userId = await getSession()

    // Try to connect to database
    let dbConnected = false
    let userCount = 0
    let dbError = null

    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("users").select("id", { count: "exact" })
      
      if (error) {
        dbError = error.message
      } else {
        dbConnected = true
        userCount = data?.length || 0
      }
    } catch (err: any) {
      dbError = err.message
    }

    return NextResponse.json({
      environment: {
        hasUrl,
        hasKey,
        hasPublicUrl,
        hasPublicKey,
        nodeEnv: process.env.NODE_ENV,
      },
      session: {
        hasSession: !!userId,
        userId: userId || null,
      },
      database: {
        connected: dbConnected,
        userCount,
        error: dbError,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Debug failed",
        message: error.message,
      },
      { status: 500 }
    )
  }
}
