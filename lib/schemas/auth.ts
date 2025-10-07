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
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().optional(),
  pin: z.string().optional(),
  loginMethod: z.enum(["password", "pin"]),
}).refine(
  (data) => {
    if (data.loginMethod === "password") return !!data.password
    if (data.loginMethod === "pin") return !!data.pin && /^\d{4}$/.test(data.pin)
    return false
  },
  {
    message: "Invalid credentials for selected login method",
  }
)

export type SigninInput = z.infer<typeof signinSchema>

// Complete profile schema (for Google OAuth users)
export const completeProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must contain only digits"),
})

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>

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
