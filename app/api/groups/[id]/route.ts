import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// PATCH - Update group details
export async function PATCH(
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
    const { name, description } = body

    const supabase = await createClient()

    // Check if user is admin
    const { data: group } = await supabase
      .from("groups")
      .select("created_by")
      .eq("id", groupId)
      .single()

    if (!group || group.created_by !== userId) {
      return NextResponse.json({ success: false, error: "Only admins can update group" }, { status: 403 })
    }

    // Update group
    const { error } = await supabase
      .from("groups")
      .update({
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)

    if (error) {
      console.error("Error updating group:", error)
      return NextResponse.json({ success: false, error: "Failed to update group" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in group PATCH:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete group
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
    const supabase = await createClient()

    // Check if user is the creator
    const { data: group } = await supabase
      .from("groups")
      .select("created_by")
      .eq("id", groupId)
      .single()

    if (!group || group.created_by !== userId) {
      return NextResponse.json({ success: false, error: "Only the creator can delete the group" }, { status: 403 })
    }

    // Delete group (cascades to members, expenses, etc.)
    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", groupId)

    if (error) {
      console.error("Error deleting group:", error)
      return NextResponse.json({ success: false, error: "Failed to delete group" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in group DELETE:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get group details
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

    // Check if user is a member
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single()

    if (!membership) {
      return NextResponse.json({ success: false, error: "Not a member of this group" }, { status: 403 })
    }

    // Get group details
    const { data: group, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single()

    if (error) {
      console.error("Error fetching group:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch group" }, { status: 500 })
    }

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error("Error in group GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
