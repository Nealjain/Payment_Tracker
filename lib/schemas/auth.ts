import { z } from "zod"

// Signup schema
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must contain only digits"),
})

export type SignupInput = z.infer<typeof signupSchema>

// Signin schema
export const signinSchema = z.object({
  // Allow either email, username, or phoneNumber as identifier
  email: z.string().email("Invalid email address").optional(),
  username: z.string().min(1).optional(),
  phoneNumber: z.string().min(6).optional(),
  // Credentials
  password: z.string().min(1).optional(),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits").optional(),
}).refine(
  (data) => !!(data.email || data.username || data.phoneNumber),
  { message: "An identifier is required (email, username or phoneNumber)" }
).refine(
  (data) => !!(data.password || data.pin),
  { message: "Either password or 4-digit PIN is required" }
)

export type SigninInput = z.infer<typeof signinSchema>

// Update PIN schema
export const updatePinSchema = z.object({
  currentPin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must contain only digits"),
  newPin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must contain only digits"),
})

export type UpdatePinInput = z.infer<typeof updatePinSchema>

// Update phone schema
export const updatePhoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must contain only digits"),
})

export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>
