import { z } from "zod"

// Create group schema
export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name too long"),
  description: z.string().max(500, "Description too long").optional(),
  currency: z.string().length(3, "Currency must be 3-letter code").optional(),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>

// Update group schema
export const updateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  currency: z.string().length(3, "Currency must be 3-letter code").optional(),
})

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>

// Add expense schema
export const addGroupExpenseSchema = z.object({
  description: z.string().min(1, "Description is required").max(200, "Description too long"),
  amount: z.number().positive("Amount must be positive"),
  paidBy: z.string().uuid("Invalid user ID"),
  splitType: z.enum(["equal", "custom"]).default("equal"),
  splits: z.array(z.object({
    userId: z.string().uuid(),
    amount: z.number().nonnegative(),
  })).optional(),
  category: z.string().optional(),
})

export type AddGroupExpenseInput = z.infer<typeof addGroupExpenseSchema>

// Group message schema
export const groupMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
})

export type GroupMessageInput = z.infer<typeof groupMessageSchema>

// Update message schema
export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
})

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>
