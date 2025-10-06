import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// GET - Fetch messages for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.id
    const supabase = await createClient()

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single()

    if (!membership) {
      return NextResponse.json({ success: false, error: "Not a member of this group" }, { status: 403 })
    }

    // Fetch messages (not expired and not deleted)
    const { data: messages, error } = await supabase
      .from("group_messages")
      .select(`
        id,
        message,
        created_at,
        edited_at,
        user_id,
        users:user_id (
          username
        )
      `)
      .eq("group_id", groupId)
      .eq("is_deleted", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(100)

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
    }

    // Set cache headers for browser caching (5 seconds)
    return NextResponse.json(
      { success: true, messages: messages || [] },
      {
        headers: {
          "Cache-Control": "private, max-age=5, stale-while-revalidate=10",
          "CDN-Cache-Control": "private, max-age=5",
        },
      }
    )
  } catch (error) {
    console.error("Error in messages GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.id
    const body = await request.json()
    const message = body.message?.trim()

    if (!message) {
      return NextResponse.json({ success: false, error: "Message cannot be empty" }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ success: false, error: "Message too long (max 1000 characters)" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is a member of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single()

    if (!membership) {
      return NextResponse.json({ success: false, error: "Not a member of this group" }, { status: 403 })
    }

    // Insert message
    const { data, error } = await supabase
      .from("group_messages")
      .insert({
        group_id: groupId,
        user_id: userId,
        message,
      })
      .select(`
        id,
        message,
        created_at,
        edited_at,
        user_id,
        users:user_id (
          username
        )
      `)
      .single()

    if (error) {
      console.error("Error sending message:", error)
      return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error("Error in messages POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Edit a message (within 1 minute)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.id
    const body = await request.json()
    const { messageId, message } = body

    if (!messageId || !message?.trim()) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ success: false, error: "Message too long" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the message and verify ownership
    const { data: existingMessage, error: fetchError } = await supabase
      .from("group_messages")
      .select("user_id, created_at, is_deleted")
      .eq("id", messageId)
      .eq("group_id", groupId)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    if (existingMessage.user_id !== userId) {
      return NextResponse.json({ success: false, error: "Not your message" }, { status: 403 })
    }

    if (existingMessage.is_deleted) {
      return NextResponse.json({ success: false, error: "Message already deleted" }, { status: 400 })
    }

    // Check if within 1 minute
    const messageAge = Date.now() - new Date(existingMessage.created_at).getTime()
    if (messageAge > 60000) {
      return NextResponse.json({ success: false, error: "Can only edit within 1 minute" }, { status: 400 })
    }

    // Update message
    const { error: updateError } = await supabase
      .from("group_messages")
      .update({
        message: message.trim(),
        edited_at: new Date().toISOString(),
      })
      .eq("id", messageId)

    if (updateError) {
      console.error("Error editing message:", updateError)
      return NextResponse.json({ success: false, error: "Failed to edit message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in messages PUT:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a message (within 1 minute)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.id
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")

    if (!messageId) {
      return NextResponse.json({ success: false, error: "Message ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the message and verify ownership
    const { data: existingMessage, error: fetchError } = await supabase
      .from("group_messages")
      .select("user_id, created_at, is_deleted")
      .eq("id", messageId)
      .eq("group_id", groupId)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    if (existingMessage.user_id !== userId) {
      return NextResponse.json({ success: false, error: "Not your message" }, { status: 403 })
    }

    if (existingMessage.is_deleted) {
      return NextResponse.json({ success: false, error: "Message already deleted" }, { status: 400 })
    }

    // Check if within 1 minute
    const messageAge = Date.now() - new Date(existingMessage.created_at).getTime()
    if (messageAge > 60000) {
      return NextResponse.json({ success: false, error: "Can only delete within 1 minute" }, { status: 400 })
    }

    // Soft delete message
    const { error: deleteError } = await supabase
      .from("group_messages")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", messageId)

    if (deleteError) {
      console.error("Error deleting message:", deleteError)
      return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in messages DELETE:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
