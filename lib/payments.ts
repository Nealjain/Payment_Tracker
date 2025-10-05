import { createClient } from "@/lib/supabase/server"
import type { Payment, PaymentFormData } from "@/lib/types"

export async function createPayment(
  userId: string,
  paymentData: PaymentFormData,
): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        amount: paymentData.amount,
        type: paymentData.type,
        direction: paymentData.direction,
        description: paymentData.description || null,
        category: paymentData.category || null,
        date: paymentData.date,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, payment: data }
  } catch (error) {
    return { success: false, error: "Failed to create payment" }
  }
}

export async function getPayments(userId: string): Promise<{ success: boolean; payments?: Payment[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, payments: data }
  } catch (error) {
    return { success: false, error: "Failed to fetch payments" }
  }
}

export async function updatePayment(
  userId: string,
  paymentId: string,
  paymentData: PaymentFormData,
): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payments")
      .update({
        amount: paymentData.amount,
        type: paymentData.type,
        direction: paymentData.direction,
        description: paymentData.description || null,
        category: paymentData.category || null,
        date: paymentData.date,
      })
      .eq("id", paymentId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, payment: data }
  } catch (error) {
    return { success: false, error: "Failed to update payment" }
  }
}

export async function deletePayment(userId: string, paymentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("payments").delete().eq("id", paymentId).eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete payment" }
  }
}

export async function getPaymentStats(userId: string): Promise<{
  success: boolean
  stats?: {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    outstandingDues: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("payments").select("amount, direction").eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    const totalIncome = data.filter((p) => p.direction === "incoming").reduce((sum, p) => sum + Number(p.amount), 0)

    const totalExpenses = data.filter((p) => p.direction === "outgoing").reduce((sum, p) => sum + Number(p.amount), 0)

    const netBalance = totalIncome - totalExpenses

    // For outstanding dues, we'll consider negative amounts as dues owed
    const outstandingDues = data
      .filter((p) => p.direction === "outgoing" && Number(p.amount) < 0)
      .reduce((sum, p) => sum + Math.abs(Number(p.amount)), 0)

    return {
      success: true,
      stats: {
        totalIncome,
        totalExpenses,
        netBalance,
        outstandingDues,
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to calculate stats" }
  }
}
