// Smart onboarding logic and personalization engine

import {
  UserType,
  FocusArea,
  UserOnboardingData,
  DashboardWidget,
  ModulesEnabled,
} from "./types/onboarding"

// Generate personalized modules based on user profile
export function generateModulesEnabled(
  userType: UserType,
  focusAreas: FocusArea[]
): ModulesEnabled {
  const modules: ModulesEnabled = {
    autoImport: false,
    sharedLedger: false,
    goals: false,
    budgets: false,
    bills: false,
    clientTracking: false,
    investments: false,
    reports: false,
    analytics: false,
  }

  // User type specific modules
  switch (userType) {
    case "freelancer":
      modules.clientTracking = true
      modules.reports = true
      modules.analytics = true
      break
    case "homemaker":
      modules.sharedLedger = true
      modules.bills = true
      modules.budgets = true
      break
    case "professional":
      modules.goals = true
      modules.investments = true
      modules.analytics = true
      break
    case "student":
      modules.budgets = true
      modules.goals = true
      break
    case "retired":
      modules.investments = true
      modules.bills = true
      break
  }

  // Focus area specific modules
  focusAreas.forEach((area) => {
    switch (area) {
      case "budgets_goals":
        modules.budgets = true
        modules.goals = true
        break
      case "shared_household":
        modules.sharedLedger = true
        modules.bills = true
        break
      case "business_transactions":
        modules.clientTracking = true
        modules.reports = true
        modules.analytics = true
        break
      case "income_expenses":
        modules.analytics = true
        modules.reports = true
        break
    }
  })

  return modules
}

// Generate personalized dashboard widgets
export function generateDashboardWidgets(
  userType: UserType,
  focusAreas: FocusArea[],
  modules: ModulesEnabled
): DashboardWidget[] {
  const widgets: DashboardWidget[] = []
  let order = 0

  // Always show balance
  widgets.push({
    id: "balance",
    type: "balance",
    title: "Current Balance",
    enabled: true,
    order: order++,
    size: "large",
  })

  // User type specific widgets
  if (userType === "freelancer") {
    widgets.push(
      {
        id: "income-tracker",
        type: "income",
        title: "Income Tracker",
        enabled: true,
        order: order++,
        size: "medium",
      },
      {
        id: "pending-payments",
        type: "clients",
        title: "Pending Payments",
        enabled: modules.clientTracking,
        order: order++,
        size: "medium",
      }
    )
  }

  if (userType === "homemaker") {
    widgets.push(
      {
        id: "household-summary",
        type: "summary",
        title: "Household Summary",
        enabled: true,
        order: order++,
        size: "large",
      },
      {
        id: "bills-due",
        type: "bills",
        title: "Bills Due",
        enabled: modules.bills,
        order: order++,
        size: "medium",
      },
      {
        id: "groceries",
        type: "category",
        title: "Groceries This Month",
        enabled: true,
        order: order++,
        size: "small",
      }
    )
  }

  if (userType === "professional") {
    widgets.push(
      {
        id: "monthly-spend",
        type: "spending",
        title: "Monthly Spending",
        enabled: true,
        order: order++,
        size: "medium",
      },
      {
        id: "savings-goal",
        type: "goals",
        title: "Savings Goals",
        enabled: modules.goals,
        order: order++,
        size: "medium",
      },
      {
        id: "investments",
        type: "investments",
        title: "Investment Overview",
        enabled: modules.investments,
        order: order++,
        size: "medium",
      }
    )
  }

  if (userType === "student") {
    widgets.push(
      {
        id: "budget-overview",
        type: "budget",
        title: "Budget Overview",
        enabled: modules.budgets,
        order: order++,
        size: "large",
      },
      {
        id: "daily-spending",
        type: "spending",
        title: "Daily Spending",
        enabled: true,
        order: order++,
        size: "medium",
      }
    )
  }

  // Focus area specific widgets
  if (focusAreas.includes("budgets_goals")) {
    if (!widgets.find((w) => w.type === "budget")) {
      widgets.push({
        id: "budget-overview",
        type: "budget",
        title: "Budget Overview",
        enabled: modules.budgets,
        order: order++,
        size: "medium",
      })
    }
    if (!widgets.find((w) => w.type === "goals")) {
      widgets.push({
        id: "goal-tracker",
        type: "goals",
        title: "Goal Progress",
        enabled: modules.goals,
        order: order++,
        size: "medium",
      })
    }
  }

  if (focusAreas.includes("business_transactions")) {
    widgets.push({
      id: "business-analytics",
      type: "analytics",
      title: "Business Analytics",
      enabled: modules.analytics,
      order: order++,
      size: "large",
    })
  }

  // Always add insights and reports at the end
  widgets.push(
    {
      id: "insights",
      type: "insights",
      title: "Smart Insights",
      enabled: modules.analytics,
      order: order++,
      size: "medium",
    },
    {
      id: "recent-transactions",
      type: "transactions",
      title: "Recent Transactions",
      enabled: true,
      order: order++,
      size: "large",
    }
  )

  return widgets.filter((w) => w.enabled)
}

// Get recommended expense categories based on user type
export function getRecommendedCategories(userType: UserType): string[] {
  const baseCategories = ["Groceries", "Utilities", "Transport", "Health", "Miscellaneous"]

  switch (userType) {
    case "professional":
      return [...baseCategories, "Rent", "Subscriptions", "Dining", "Entertainment", "Insurance"]
    case "freelancer":
      return [
        ...baseCategories,
        "Rent",
        "Business Expenses",
        "Software",
        "Marketing",
        "Equipment",
      ]
    case "homemaker":
      return [...baseCategories, "Rent", "Education", "Household Items", "Maintenance"]
    case "student":
      return [...baseCategories, "Tuition", "Books", "Entertainment", "Dining", "Rent"]
    case "retired":
      return [...baseCategories, "Health", "Insurance", "Leisure", "Maintenance"]
    default:
      return baseCategories
  }
}

// Get recommended notifications based on user preferences
export function getRecommendedNotifications(
  userType: UserType,
  focusAreas: FocusArea[]
): string[] {
  const notifications: string[] = []

  // Base notifications for everyone
  notifications.push("Weekly summary")

  if (userType === "freelancer" || userType === "professional") {
    notifications.push("Salary received", "Bill due reminders")
  }

  if (userType === "homemaker") {
    notifications.push("Bill due reminders", "Budget warnings", "Overspend alerts")
  }

  if (userType === "student") {
    notifications.push("Budget warnings", "Overspend alerts")
  }

  if (focusAreas.includes("budgets_goals")) {
    notifications.push("Goal milestones", "Budget warnings")
  }

  if (focusAreas.includes("business_transactions")) {
    notifications.push("Payment received", "Invoice due")
  }

  return [...new Set(notifications)] // Remove duplicates
}

// Validate onboarding data completeness
export function validateOnboardingData(data: Partial<UserOnboardingData>): {
  isValid: boolean
  missingFields: string[]
} {
  const missingFields: string[] = []

  if (!data.profile?.userType) missingFields.push("userType")
  if (!data.preferences?.focusAreas?.length) missingFields.push("focusAreas")
  if (!data.preferences?.incomeType) missingFields.push("incomeType")
  if (!data.preferences?.trackingMethod) missingFields.push("trackingMethod")

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}
