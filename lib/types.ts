export interface User {
  id: string
  pin_hash: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  type: "cash" | "online"
  direction: "incoming" | "outgoing"
  description?: string
  category?: string
  date: string
  created_at: string
  updated_at: string
}

export interface PaymentFormData {
  amount: number
  type: "cash" | "online"
  direction: "incoming" | "outgoing"
  description?: string
  category?: string
  date: string
}
