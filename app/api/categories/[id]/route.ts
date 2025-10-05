import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { sanitizeInput } from "@/lib/api-security"

// PUT - Update category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = body.name ? sanitizeInput(body.name, 100) : undefined
    const type = body.type ? sanitizeInput(body.type, 20) : undefined
    const color = body.color ? sanitizeInput(body.color, 7) : undefined
    const icon = body.icon ? sanitizeInput(body.icon, 50) : undefined

    if (type && !["income", "expense", "both"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 })
    }

    const supabase = await createClient()

    const updateData: any = { updated_at: new Date().toISOString() }
    if (name) updateData.name = name
    if (type) updateData.type = type
    if (color) updateData.color = color
    if (icon !== undefined) updateData.icon = icon

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: data })
  } catch (error) {
    console.error("Error in category PUT:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if it's a default category
    const { data: category } = await supabase
      .from("categories")
      .select("is_default")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single()

    if (category?.is_default) {
      return NextResponse.json({ success: false, error: "Cannot delete default category" }, { status: 400 })
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId)

    if (error) {
      console.error("Error deleting category:", error)
      return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in category DELETE:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
