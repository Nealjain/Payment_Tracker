"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  UserType,
  FocusArea,
  IncomeType,
  IncomeFrequency,
  BudgetStyle,
  TrackingMethod,
  SharingOption,
  ThemePreference,
  DashboardLayout,
  UserOnboardingData,
} from "@/lib/types/onboarding"
import {
  generateModulesEnabled,
  generateDashboardWidgets,
  getRecommendedCategories,
  getRecommendedNotifications,
} from "@/lib/onboarding-logic"

// Import step components
import WelcomeStep from "@/components/onboardin