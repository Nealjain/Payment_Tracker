import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

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
