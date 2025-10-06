import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

// GET - Get all expenses for a group
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

    // Get expenses with splits
    const { data: expenses, error } = await supabase
      .from("group_expenses")
      .select(`
        *,
        paid_by_user:users!group_expenses_paid_by_fkey(username),
        splits:group_expense_splits(
          *,
          user:users(username)
        )
      `)
      .eq("group_id", groupId)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching expenses:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch expenses" }, { status: 500 })
    }

    return NextResponse.json({ success: true, expenses: expenses || [] })
  } catch (error) {
    console.error("Error in expenses GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add expense to group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, category, date, splitMethod, splits } = await request.json()
    const groupId = params.id

    if (!amount || !description || !date) {
      return NextResponse.json({ success: false, error: "Amount, description, and date required" }, { status: 400 })
    }

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

    // Get all group members
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id, users(username)")
      .eq("group_id", groupId)

    if (!members || members.length === 0) {
      return NextResponse.json({ success: false, error: "No members in group" }, { status: 400 })
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from("group_expenses")
      .insert({
        group_id: groupId,
        paid_by: userId,
        amount: Number(amount),
        description,
        category: category || null,
        date,
        split_method: splitMethod || "equal",
      })
      .select()
      .single()

    if (expenseError) {
      console.error("Error creating expense:", expenseError)
      return NextResponse.json({ success: false, error: "Failed to create expense" }, { status: 500 })
    }

    // Calculate splits
    let expenseSplits = []
    if (splits && splits.length > 0) {
      // Custom splits provided
      expenseSplits = splits
    } else {
      // Equal split among all members
      const splitAmount = Number(amount) / members.length
      expenseSplits = members.map(m => ({
        user_id: m.user_id,
        amount: splitAmount,
      }))
    }

    // Insert splits
    const { error: splitsError } = await supabase
      .from("group_expense_splits")
      .insert(
        expenseSplits.map(split => ({
          expense_id: expense.id,
          user_id: split.user_id,
          amount: split.amount,
          is_settled: split.user_id === userId, // Payer is automatically settled
        }))
      )

    if (splitsError) {
      console.error("Error creating splits:", splitsError)
      // Rollback expense
      await supabase.from("group_expenses").delete().eq("id", expense.id)
      return NextResponse.json({ success: false, error: "Failed to create splits" }, { status: 500 })
    }

    // Get group name
    const { data: group } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single()

    // Notify all members except the payer
    for (const member of members) {
      if (member.user_id !== userId) {
        await supabase.rpc("create_notification", {
          p_user_id: member.user_id,
          p_type: "expense_added",
          p_title: "New Expense Added",
          p_message: `${description} - ₹${amount} in ${group?.name || "group"}`,
          p_data: { group_id: groupId, expense_id: expense.id },
          p_action_url: `/group-expenses/${groupId}`,
        })
      }
    }

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error("Error in expenses POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
