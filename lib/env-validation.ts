/**
 * Environment variable validation
 * Run this at app startup to fail fast on missing required env vars
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SESSION_SECRET",
] as const

const optionalEnvVars = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const

export function validateEnvironment() {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  }

  // Validate SESSION_SECRET length
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    missing.push("SESSION_SECRET (must be at least 32 characters)")
  }

  // Check if Redis is configured (both or neither)
  const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL
  const hasRedisToken = !!process.env.UPSTASH_REDIS_REST_TOKEN
  if (hasRedisUrl !== hasRedisToken) {
    warnings.push("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (both required for rate limiting)")
  }

  // Check if Google OAuth is configured (both or neither)
  const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID
  const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET
  if (hasGoogleId !== hasGoogleSecret) {
    warnings.push("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (both required for Google OAuth)")
  }

  // Report results
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:")
    missing.forEach((v) => console.error(`   - ${v}`))
    throw new Error("Missing required environment variables. Check .env.example for reference.")
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn("⚠️  Missing optional environment variables:")
    warnings.forEach((v) => console.warn(`   - ${v}`))
    console.warn("   Some features may not work correctly.")
  }

  console.log("✅ Environment variables validated successfully")
}

// Auto-validate in production
if (process.env.NODE_ENV === "production") {
  validateEnvironment()
}
