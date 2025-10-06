import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// GET - Fetch all notifications for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"

    const supabase = await createClient()
    
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({ success: true, notifications: data || [] })
  } catch (error) {
    console.error("Error in notifications GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, markAllRead } = await request.json()

    const supabase = await createClient()

    if (markAllRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking all as read:", error)
        return NextResponse.json({ success: false, error: "Failed to update notifications" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "Notification ID required" }, { status: 400 })
    }

    // Mark single notification as read
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error marking notification as read:", error)
      return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in notifications PATCH:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
