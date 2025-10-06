import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { period } = body // "monthly" or "yearly"

    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate = now

    if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    // Get user info
    const { data: user } = await supabase
      .from("users")
      .select("username, email")
      .eq("id", userId)
      .single()

    // Get payments
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false })

    // Get group expenses
    const { data: groupExpenses } = await supabase
      .from("group_expense_splits")
      .select(`
        *,
        group_expenses!inner(
          description,
          amount,
          date,
          groups(name)
        )
      `)
      .eq("user_id", userId)
      .gte("group_expenses.date", startDate.toISOString().split("T")[0])
      .lte("group_expenses.date", endDate.toISOString().split("T")[0])

    // Calculate stats
    const totalIncome = payments
      ?.filter((p) => p.type === "income")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const totalExpenses = payments
      ?.filter((p) => p.type === "expense")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const netBalance = totalIncome - totalExpenses

    // Category breakdown
    const categoryBreakdown = payments?.reduce((acc: any, payment) => {
      const category = payment.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 }
      }
      if (payment.type === "income") {
        acc[category].income += Number(payment.amount)
      } else {
        acc[category].expense += Number(payment.amount)
      }
      return acc
    }, {}) || {}

    // Format group expenses
    const formattedGroupExpenses = groupExpenses?.map((split: any) => ({
      group_name: split.group_expenses?.groups?.name,
      description: split.group_expenses?.description,
      amount: split.amount,
      is_settled: split.is_settled,
      date: split.group_expenses?.date,
    })) || []

    const reportData = {
      period: period === "monthly" ? "Monthly" : "Yearly",
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      totalIncome,
      totalExpenses,
      netBalance,
      payments: payments || [],
      groupExpenses: formattedGroupExpenses,
      categoryBreakdown,
      userName: user?.username || "User",
    }

    // Create notification
    await supabase.rpc("create_notification", {
      p_user_id: userId,
      p_type: "payment_request",
      p_title: `${reportData.period} Report Ready`,
      p_message: `Your ${period} financial report is ready to download. Net balance: ₹${netBalance.toFixed(2)}`,
      p_data: { report_type: period, ...reportData },
      p_action_url: "/reports",
    })

    return NextResponse.json({ success: true, data: reportData })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 })
  }
}
