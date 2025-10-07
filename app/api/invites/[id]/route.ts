import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// PATCH - Accept or reject invite
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json() // 'accept' or 'reject'
    const inviteId = params.id

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get invite
    const { data: invite, error: inviteError } = await supabase
      .from("group_invites")
      .select("*, groups(name)")
      .eq("id", inviteId)
      .eq("invited_user_id", userId)
      .eq("status", "pending")
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("group_invites")
        .update({ status: "expired" })
        .eq("id", inviteId)

      return NextResponse.json({ success: false, error: "Invite has expired" }, { status: 400 })
    }

    if (action === "accept") {
      // Add user to group
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: invite.group_id,
          user_id: userId,
          role: "member",
        })

      if (memberError) {
        console.error("Error adding member:", memberError)
        return NextResponse.json({ success: false, error: "Failed to join group" }, { status: 500 })
      }

      // Update invite status
      await supabase
        .from("group_invites")
        .update({ 
          status: "accepted",
          responded_at: new Date().toISOString(),
          uses_count: invite.uses_count + 1,
        })
        .eq("id", inviteId)

      // Notify the inviter
      await supabase.rpc("create_notification", {
        p_user_id: invite.invited_by,
        p_type: "group_invite",
        p_title: "Invite Accepted",
        p_message: `Someone joined ${invite.groups?.name || "your group"}`,
        p_data: { group_id: invite.group_id },
        p_action_url: `/group-expenses/${invite.group_id}`,
      })

      return NextResponse.json({ 
        success: true, 
        message: "Successfully joined group",
        groupId: invite.group_id,
      })
    } else {
      // Reject invite
      await supabase
        .from("group_invites")
        .update({ 
          status: "rejected",
          responded_at: new Date().toISOString(),
        })
        .eq("id", inviteId)

      return NextResponse.json({ success: true, message: "Invite rejected" })
    }
  } catch (error) {
    console.error("Error in invite PATCH:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// GET - Public view of an invite (used on join pages)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inviteId = params.id
    const supabase = await createClient()

    // Get invite with group info
    const { data: invite, error: inviteError } = await supabase
      .from("group_invites")
      .select("*, groups(*)")
      .eq("id", inviteId)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 })
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      // Mark expired (best-effort)
      await supabase
        .from("group_invites")
        .update({ status: "expired" })
        .eq("id", inviteId)

      return NextResponse.json({ success: false, error: "Invite has expired" }, { status: 400 })
    }

    return NextResponse.json({ success: true, invite, group: invite.groups })
  } catch (error) {
    console.error("Error in invite GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
