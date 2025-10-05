export interface UpiId {
  id: string
  user_id: string
  upi_id: string
  name: string
  bank_name?: string
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUpiData {
  upi_id: string
  name: string
  bank_name?: string
  is_primary?: boolean
}

export interface UpdateUpiData {
  upi_id?: string
  name?: string
  bank_name?: string
  is_primary?: boolean
  is_active?: boolean
}
