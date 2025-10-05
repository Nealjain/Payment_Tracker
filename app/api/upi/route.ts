import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"
import { sanitizeInput } from "@/lib/api-security"

// GET - Fetch all UPI IDs for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("upi_ids")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching UPI IDs:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch UPI IDs" }, { status: 500 })
    }

    return NextResponse.json({ success: true, upiIds: data || [] })
  } catch (error) {
    console.error("Error in UPI GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new UPI ID
export async function POST(request: NextRequest) {
  try {
    const userId = await getSession()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const upiId = sanitizeInput(body.upi_id, 100)
    const name = sanitizeInput(body.name, 100)
    const bankName = sanitizeInput(body.bank_name || "", 100)
    const isPrimary = body.is_primary === true

    if (!upiId || !name) {
      return NextResponse.json({ success: false, error: "UPI ID and name are required" }, { status: 400 })
    }

    // Validate UPI ID format (basic validation)
    const upiRegex = /^[\w.-]+@[\w.-]+$/
    if (!upiRegex.test(upiId)) {
      return NextResponse.json({ success: false, error: "Invalid UPI ID format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if UPI ID already exists
    const { data: existing } = await supabase
      .from("upi_ids")
      .select("id")
      .eq("user_id", userId)
      .eq("upi_id", upiId)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: "UPI ID already exists" }, { status: 400 })
    }

    // Create UPI ID
    const { data, error } = await supabase
      .from("upi_ids")
      .insert({
        user_id: userId,
        upi_id: upiId,
        name,
        bank_name: bankName || null,
        is_primary: isPrimary,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating UPI ID:", error)
      return NextResponse.json({ success: false, error: "Failed to create UPI ID" }, { status: 500 })
    }

    return NextResponse.json({ success: true, upiId: data })
  } catch (error) {
    console.error("Error in UPI POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
