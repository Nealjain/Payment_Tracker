export interface Group {
  id: string
  name: string
  description?: string
  cover_image?: string
  invite_code: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  user?: {
    username: string
    email?: string
  }
}

export interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  message: string
  created_at: string
  user?: {
    username: string
  }
}

export interface GroupPayment {
  id: string
  group_id: string
  payer_id: string
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
  payer?: {
    username: string
  }
  participants?: PaymentParticipant[]
}

export interface PaymentParticipant {
  id: string
  payment_id: string
  user_id: string
  share_amount: number
  is_settled: boolean
  settled_at?: string
  user?: {
    username: string
  }
}

export interface MemberBalance {
  user_id: string
  username: string
  total_paid: number
  total_owed: number
  balance: number // positive = owed to them, negative = they owe
}

export interface CreateGroupPaymentData {
  group_id: string
  payer_id: string
  amount: number
  description: string
  date: string
  participants: {
    user_id: string
    share_amount: number
  }[]
}
