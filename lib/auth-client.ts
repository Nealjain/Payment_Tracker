// Client-side authentication functions
import { createClient } from "@/lib/supabase/client"

// Google OAuth Authentication (client-side only)
export async function signInWithGoogle() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Client-side sign out
export async function signOutClient() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
