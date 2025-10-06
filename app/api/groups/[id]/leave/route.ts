import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// POST - Leave a group
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
    const supabase = await createClient()

    // Get group and membership info
    const { data: group } = await supabase
      .from("groups")
      .select("name, created_by")
      .eq("id", groupId)
      .single()

    if (!group) {
      return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 })
    }

    // Check if user is the creator
    if (group.created_by === userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Group creator cannot leave. Delete the group instead." 
      }, { status: 400 })
    }

    // Check for unsettled expenses
    const { data: unsettled } = await supabase
      .from("group_expense_splits")
      .select("id, expense:group_expenses(group_id)")
      .eq("user_id", userId)
      .eq("is_settled", false)

    const hasUnsettled = unsettled?.some((s: any) => s.expense?.group_id === groupId)

    if (hasUnsettled) {
      return NextResponse.json({ 
        success: false, 
        error: "Please settle all your expenses before leaving" 
      }, { status: 400 })
    }

    // Remove from group
    const { error: deleteError } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Error leaving group:", deleteError)
      return NextResponse.json({ success: false, error: "Failed to leave group" }, { status: 500 })
    }

    // Notify group admin
    await supabase.rpc("create_notification", {
      p_user_id: group.created_by,
      p_type: "group_left",
      p_title: "Member Left Group",
      p_message: `A member left ${group.name}`,
      p_data: { group_id: groupId },
      p_action_url: `/group-expenses/${groupId}`,
    })

    return NextResponse.json({ success: true, message: "Left group successfully" })
  } catch (error) {
    console.error("Error in leave POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
