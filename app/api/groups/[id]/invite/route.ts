import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// POST - Invite user to group by username or email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { identifier } = await request.json() // username or email
    const groupId = params.id

    if (!identifier?.trim()) {
      return NextResponse.json({ success: false, error: "Username or email required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is admin of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single()

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can invite members" }, { status: 403 })
    }

    // Find user by username or email
    const isEmail = identifier.includes("@")
    const { data: invitedUser, error: userError } = await supabase
      .from("users")
      .select("id, username, email")
      .or(isEmail ? `email.eq.${identifier}` : `username.eq.${identifier}`)
      .single()

    if (userError || !invitedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", invitedUser.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ success: false, error: "User is already a member" }, { status: 400 })
    }

    // Check for recent invite (within last hour)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: recentInvite } = await supabase
      .from("group_invites")
      .select("id, created_at, status")
      .eq("group_id", groupId)
      .eq("invited_user_id", invitedUser.id)
      .gte("created_at", oneHourAgo.toISOString())
      .single()

    if (recentInvite) {
      if (recentInvite.status === "pending") {
        return NextResponse.json({ 
          success: false, 
          error: "Invite already sent. Please wait before sending another." 
        }, { status: 400 })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: "An invite was recently sent to this user. Please wait 1 hour before sending another." 
        }, { status: 400 })
      }
    }

    // Get group name
    const { data: group } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single()

    // Create invite
    const inviteCode = Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const { data: invite, error: inviteError } = await supabase
      .from("group_invites")
      .insert({
        group_id: groupId,
        invited_by: userId,
        invited_user_id: invitedUser.id,
        invited_email: invitedUser.email,
        invited_username: invitedUser.username,
        invite_code: inviteCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      console.error("Error creating invite:", inviteError)
      return NextResponse.json({ success: false, error: "Failed to create invite" }, { status: 500 })
    }

    // Create notification
    await supabase.rpc("create_notification", {
      p_user_id: invitedUser.id,
      p_type: "group_invite",
      p_title: "Group Invite",
      p_message: `You've been invited to join ${group?.name || "a group"}`,
      p_data: { group_id: groupId, invite_id: invite.id },
      p_action_url: `/notifications`,
    })

    return NextResponse.json({ success: true, invite })
  } catch (error) {
    console.error("Error in invite POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
