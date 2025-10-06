import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// PATCH - Update member role
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const userId = await getSession()
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { id: groupId, memberId } = params
        const body = await request.json()
        const { role } = body

        if (!role || !["admin", "member"].includes(role)) {
            return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
        }

        const supabase = await createClient()

        // Check if user is admin
        const { data: userMember } = await supabase
            .from("group_members")
            .select("role, groups!inner(created_by)")
            .eq("group_id", groupId)
            .eq("user_id", userId)
            .single()

        const groupCreator = (userMember as any)?.groups?.created_by
        if (!userMember || (userMember.role !== "admin" && groupCreator !== userId)) {
            return NextResponse.json({ success: false, error: "Only admins can change roles" }, { status: 403 })
        }

        // Update member role
        const { error } = await supabase
            .from("group_members")
            .update({ role })
            .eq("id", memberId)
            .eq("group_id", groupId)

        if (error) {
            console.error("Error updating member role:", error)
            return NextResponse.json({ success: false, error: "Failed to update role" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in member PATCH:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}

// DELETE - Remove member from group
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const userId = await getSession()
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { id: groupId, memberId } = params
        const supabase = await createClient()

        // Check if user is admin
        const { data: userMember } = await supabase
            .from("group_members")
            .select("role, groups!inner(created_by)")
            .eq("group_id", groupId)
            .eq("user_id", userId)
            .single()

        const groupCreator = (userMember as any)?.groups?.created_by
        if (!userMember || (userMember.role !== "admin" && groupCreator !== userId)) {
            return NextResponse.json({ success: false, error: "Only admins can remove members" }, { status: 403 })
        }

        // Get member to check if they're the creator
        const { data: memberToRemove } = await supabase
            .from("group_members")
            .select("user_id, groups!inner(created_by)")
            .eq("id", memberId)
            .eq("group_id", groupId)
            .single()

        if (!memberToRemove) {
            return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 })
        }

        const memberGroupCreator = (memberToRemove as any)?.groups?.created_by
        if (memberToRemove.user_id === memberGroupCreator) {
            return NextResponse.json({ success: false, error: "Cannot remove group creator" }, { status: 400 })
        }

        // Remove member
        const { error } = await supabase
            .from("group_members")
            .delete()
            .eq("id", memberId)
            .eq("group_id", groupId)

        if (error) {
            console.error("Error removing member:", error)
            return NextResponse.json({ success: false, error: "Failed to remove member" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in member DELETE:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
