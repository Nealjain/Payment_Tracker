import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentAuthUser } from "@/lib/auth"

// GET /api/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ preferences: data || null })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/preferences - Create or update preferences
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()

    // Check if preferences exist
    const { data: existing } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", user.id)
      .single()

    const preferencesData = {
      user_id: user.id,
      user_type: body.profile?.userType,
      currency: body.profile?.currency || "INR",
      locale: body.profile?.locale || "en-IN",
      focus_areas: body.preferences?.focusAreas || [],
      income_type: body.preferences?.incomeType,
      income_frequency: body.preferences?.incomeFrequency,
      expense_categories: body.preferences?.expenseCategories || [],
      budget_style: body.preferences?.budgetStyle,
      tracking_method: body.preferences?.trackingMethod,
      notifications: body.preferences?.notifications || [],
      sharing_option: body.preferences?.sharingOption || "only_me",
      biometric_lock: body.preferences?.biometricLock || false,
      theme_preference: body.preferences?.themePreference || "auto",
      dashboard_layout: body.preferences?.dashboardLayout || "graphical",
      modules_enabled: body.modulesEnabled || {},
      dashboard_widgets: body.dashboardWidgets || [],
      onboarding_completed: body.onboardingCompleted || false,
      onboarding_completed_at: body.onboardingCompleted ? new Date().toISOString() : null,
    }

    let result
    if (existing) {
      // Update existing preferences
      result = await supabase
        .from("user_preferences")
        .update(preferencesData)
        .eq("user_id", user.id)
        .select()
        .single()
    } else {
      // Insert new preferences
      result = await supabase.from("user_preferences").insert(preferencesData).select().single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, preferences: result.data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/preferences - Reset preferences
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("user_preferences").delete().eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
