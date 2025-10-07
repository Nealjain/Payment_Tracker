import { z } from "zod"

// Payment schema
export const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  type: z.enum(["income", "expense"]),
  paymentMethod: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

// Update payment schema
export const updatePaymentSchema = paymentSchema.partial().extend({
  id: z.string().uuid(),
})

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
