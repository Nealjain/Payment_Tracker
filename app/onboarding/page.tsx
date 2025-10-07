"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import WelcomeStep from "@/components/onboarding/welcome-step"
import UserTypeStep from "@/components/onboarding/user-type-step"
import FocusAreasStep from "@/components/onboarding/focus-areas-step"

type OnboardingStep = "welcome" | "userType" | "focusAreas" | "complete"

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [preferences, setPreferences] = useState({
    userType: "",
    focusAreas: [] as string[],
  })

  const handleStart = () => {
    setCurrentStep("userType")
  }

  const handleSkip = async () => {
    // Mark onboarding as completed and go to dashboard
    await completeOnboarding()
  }

  const handleUserTypeSelect = (userType: string) => {
    setPreferences({ ...preferences, userType })
    setCurrentStep("focusAreas")
  }

  const handleFocusAreasSelect = async (focusAreas: string[]) => {
    setPreferences({ ...preferences, focusAreas })
    await savePreferences({ ...preferences, focusAreas })
  }

  const savePreferences = async (prefs: typeof preferences) => {
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: prefs.userType,
          focus_areas: prefs.focusAreas,
          onboarding_completed: true,
        }),
      })

      if (response.ok) {
        toast({ title: "Setup complete!", description: "Welcome to PayDhan" })
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 500)
      } else {
        throw new Error("Failed to save preferences")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Redirecting anyway...",
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    }
  }

  const completeOnboarding = async () => {
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed: true }),
      })
    } catch (error) {
      console.error("Failed to mark onboarding complete:", error)
    }
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-2xl">
        {currentStep === "welcome" && <WelcomeStep onStart={handleStart} onSkip={handleSkip} />}
        {currentStep === "userType" && (
          <UserTypeStep onSelect={handleUserTypeSelect} onBack={() => setCurrentStep("welcome")} />
        )}
        {currentStep === "focusAreas" && (
          <FocusAreasStep
            onSelect={handleFocusAreasSelect}
            onBack={() => setCurrentStep("userType")}
            userType={preferences.userType}
          />
        )}
      </div>
    </div>
  )
}
