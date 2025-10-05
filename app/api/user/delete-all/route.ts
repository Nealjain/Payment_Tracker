import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })

    // Delete all payments for this user
    const { error: paymentsError } = await supabase.from("payments").delete().eq("user_id", user.id)

    if (paymentsError) {
      throw paymentsError
    }

    // Delete the user account
    const { error: userError } = await supabase.from("users").delete().eq("id", user.id)

    if (userError) {
      throw userError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete all data error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete data" }, { status: 500 })
  }
}
