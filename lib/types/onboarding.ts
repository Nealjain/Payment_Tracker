// Onboarding and User Preference Types

export type UserType = 
  | "professional" 
  | "freelancer" 
  | "homemaker" 
  | "student" 
  | "retired" 
  | "other"

export type FocusArea = 
  | "income_expenses" 
  | "budgets_goals" 
  | "shared_household" 
  | "business_transactions" 
  | "daily_spending"

export type IncomeType = "salary" | "business" | "allowance" | "investments" | "other"
export type IncomeFrequency = "monthly" | "weekly" | "biweekly" | "irregular"
export type BudgetStyle = "envelope" | "monthly_total" | "category_based" | "none"
export type TrackingMethod = "auto" | "manual" | "csv_import" | "mixed"
export type SharingOption = "only_me" | "shared_household" | "accountant" | "family"
export type ThemePreference = "dark" | "light" | "auto"
export type DashboardLayout = "compact" | "graphical" | "timeline"

export interface OnboardingProfile {
  userType: UserType
  currency: string
  locale: string
  completedAt?: Date
}

export interface UserPreferences {
  focusAreas: FocusArea[]
  incomeType: IncomeType
  incomeFrequency: IncomeFrequency
  expenseCategories: string[]
  budgetStyle: BudgetStyle
  trackingMethod: TrackingMethod
  notifications: string[]
  sharingOption: SharingOption
  biometricLock: boolean
  themePreference: ThemePreference
  dashboardLayout: DashboardLayout
}

export interface ModulesEnabled {
  autoImport: boolean
  sharedLedger: boolean
  goals: boolean
  budgets: boolean
  bills: boolean
  clientTracking: boolean
  investments: boolean
  reports: boolean
  analytics: boolean
}

export interface DashboardWidget {
  id: string
  type: string
  title: string
  enabled: boolean
  order: number
  size: "small" | "medium" | "large"
}

export interface UserOnboardingData {
  profile: OnboardingProfile
  preferences: UserPreferences
  modulesEnabled: ModulesEnabled
  dashboardWidgets: DashboardWidget[]
  createdAt: Date
  updatedAt: Date
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Groceries",
  "Subscriptions",
  "Transport",
  "Health",
  "Education",
  "Entertainment",
  "Shopping",
  "Dining",
  "Insurance",
  "Miscellaneous"
]

export const DEFAULT_NOTIFICATIONS = [
  "Bill due reminders",
  "Overspend alerts",
  "Weekly summary",
  "Salary received",
  "Goal milestones",
  "Budget warnings"
]
