import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/session"

const SPECIAL_CREDENTIAL = "23781038"
const SALT_ROUNDS = 12

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function verifySpecialCredential(credential: string): Promise<boolean> {
  return credential === SPECIAL_CREDENTIAL
}

export async function createUser(
  username: string,
  pin: string,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if username already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("username", username).single()

    if (existingUser) {
      return { success: false, error: "Username already exists" }
    }

    const pinHash = await hashPin(pin)

    const { data, error } = await supabase.from("users").insert({ username, pin_hash: pinHash }).select("id").single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, userId: data.id }
  } catch (error) {
    return { success: false, error: "Failed to create user" }
  }
}

export async function authenticateUser(
  username: string,
  pin: string,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: user, error } = await supabase.from("users").select("id, pin_hash").eq("username", username).single()

    if (error || !user) {
      return { success: false, error: "Invalid username or PIN" }
    }

    const isValid = await verifyPin(pin, user.pin_hash)
    if (!isValid) {
      return { success: false, error: "Invalid username or PIN" }
    }

    return { success: true, userId: user.id }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

export async function resetUserPin(
  username: string,
  credential: string,
  newPin: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify special credential
    if (!(await verifySpecialCredential(credential))) {
      return { success: false, error: "Invalid credential" }
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single()

    if (fetchError || !user) {
      return { success: false, error: "Username not found" }
    }

    const newPinHash = await hashPin(newPin)

    const { error: updateError } = await supabase.from("users").update({ pin_hash: newPinHash }).eq("id", user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to reset PIN" }
  }
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("users").select("id").eq("username", username).single()

    if (error && error.code === "PGRST116") {
      // No rows returned, username is available
      return { available: true }
    }

    if (error) {
      return { available: false, error: error.message }
    }

    return { available: false }
  } catch (error) {
    return { available: false, error: "Failed to check username" }
  }
}

export async function getCurrentUser(): Promise<{ id: string; username: string } | null> {
  try {
    const userId = await getSession()
    if (!userId) {
      return null
    }

    const supabase = await createClient()
    const { data: user, error } = await supabase.from("users").select("id, username").eq("id", userId).single()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// Email/Password Authentication
export async function signUpWithEmail(email: string, password: string, username: string) {
  try {
    const supabase = await createClient()

    // Check if username already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("username", username).single()

    if (existingUser) {
      return { success: false, error: "Username already exists" }
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" }
    }

    // Create user record in users table
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      username,
      email,
    })

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return { success: true, userId: authData.user.id, user: authData.user }
  } catch (error) {
    return { success: false, error: "Failed to create account" }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, userId: data.user.id, user: data.user }
  } catch (error) {
    return { success: false, error: "Failed to sign in" }
  }
}

// Sign out (server-side)
export async function signOut() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to sign out" }
  }
}

// Get current authenticated user from Supabase Auth
export async function getCurrentAuthUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get additional user data from users table
    const { data: userData } = await supabase.from("users").select("username, email").eq("id", user.id).single()

    return {
      id: user.id,
      email: user.email,
      username: userData?.username || user.user_metadata?.username,
    }
  } catch (error) {
    return null
  }
}
