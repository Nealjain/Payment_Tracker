export interface Group {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
  member_count?: number
  total_expenses?: number
  your_balance?: number
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: "admin" | "member"
  joined_at: string
  username?: string
  email?: string
}

export interface GroupExpense {
  id: string
  group_id: string
  paid_by: string
  amount: number
  description: string
  category: string | null
  date: string
  split_method: "equal" | "percentage" | "custom"
  created_at: string
  updated_at: string
  paid_by_username?: string
  splits?: GroupExpenseSplit[]
}

export interface GroupExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount: number
  is_settled: boolean
  settled_at: string | null
  username?: string
}

export interface GroupInvite {
  id: string
  group_id: string
  invited_by: string
  invite_code: string
  expires_at: string
  max_uses: number
  uses_count: number
  created_at: string
}

export interface CreateGroupData {
  name: string
  description?: string
}

export interface CreateGroupExpenseData {
  group_id: string
  amount: number
  description: string
  category?: string
  date: string
  split_method: "equal" | "percentage" | "custom"
  splits: {
    user_id: string
    amount: number
  }[]
}
