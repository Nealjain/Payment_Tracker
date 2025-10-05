export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense' | 'both'
  color?: string
  icon?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  name: string
  type: 'income' | 'expense' | 'both'
  color?: string
  icon?: string
}

export interface UpdateCategoryData {
  name?: string
  type?: 'income' | 'expense' | 'both'
  color?: string
  icon?: string
}
