export type NotificationType = 
  | 'group_invite' 
  | 'expense_added' 
  | 'payment_request' 
  | 'payment_received' 
  | 'group_left' 
  | 'group_removed'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  action_url: string | null
  created_at: string
}

export interface CreateNotificationData {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  action_url?: string
}
