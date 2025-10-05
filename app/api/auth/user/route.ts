import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ user: null })
    }

    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ user: null })
    }

    // Get user data from users table
    const { data: userData } = await supabase
      .from("users")
      .select("username, email, phone_number")
      .eq("id", session.userId)
      .single()

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        username: userData?.username,
        phoneNumber: userData?.phone_number,
      },
    })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
