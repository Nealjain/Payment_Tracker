import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { createGroupSchema } from "@/lib/schemas/group"
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response"

// GET - Fetch all groups for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    
    // Get groups where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId)

    if (memberError) {
      console.error("Error fetching memberships:", memberError)
      return serverErrorResponse("Failed to fetch groups")
    }

    const groupIds = memberships.map(m => m.group_id)

    if (groupIds.length === 0) {
      return successResponse({ groups: [] })
    }

    // Get group details
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds)
      .order("created_at", { ascending: false })

    if (groupsError) {
      console.error("Error fetching groups:", groupsError)
      return serverErrorResponse("Failed to fetch groups")
    }

    // Get member counts and total expenses for each group
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        const { count: memberCount } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id)

        const { data: expenses } = await supabase
          .from("group_expenses")
          .select("amount")
          .eq("group_id", group.id)

        const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

        return {
          ...group,
          member_count: memberCount || 0,
          total_expenses: totalExpenses,
        }
      })
    )

    return successResponse({ groups: groupsWithStats })
  } catch (error) {
    console.error("Error in groups GET:", error)
    return serverErrorResponse("Internal server error")
  }
}

// POST - Create new group
export async function POST(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate with Zod
    const validation = createGroupSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { name, description, currency } = validation.data

    const supabase = await createClient()

    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        description: description || null,
        currency: currency || "USD",
        created_by: userId,
      })
      .select()
      .single()

    if (groupError) {
      console.error("Error creating group:", groupError)
      return serverErrorResponse("Failed to create group")
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        user_id: userId,
        role: "admin",
      })

    if (memberError) {
      console.error("Error adding member:", memberError)
      // Rollback: delete the group
      await supabase.from("groups").delete().eq("id", group.id)
      return serverErrorResponse("Failed to create group")
    }

    return successResponse({ group }, 201)
  } catch (error) {
    console.error("Error in groups POST:", error)
    return serverErrorResponse("Internal server error")
  }
}
