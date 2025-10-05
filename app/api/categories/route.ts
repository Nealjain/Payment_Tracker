import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { sanitizeInput } from "@/lib/api-security"

// GET - Fetch all categories for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // filter by type: income, expense, both

    const supabase = await createClient()
    
    let query = supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true })

    if (type && type !== "all") {
      query = query.or(`type.eq.${type},type.eq.both`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
    }

    return NextResponse.json({ success: true, categories: data || [] })
  } catch (error) {
    console.error("Error in categories GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = sanitizeInput(body.name, 100)
    const type = sanitizeInput(body.type, 20)
    const color = sanitizeInput(body.color || "#B19EEF", 7)
    const icon = sanitizeInput(body.icon || "", 50)

    if (!name || !type) {
      return NextResponse.json({ success: false, error: "Name and type are required" }, { status: 400 })
    }

    if (!["income", "expense", "both"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if category already exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", name)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: "Category already exists" }, { status: 400 })
    }

    // Create category
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name,
        type,
        color,
        icon,
        is_default: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: data })
  } catch (error) {
    console.error("Error in categories POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
