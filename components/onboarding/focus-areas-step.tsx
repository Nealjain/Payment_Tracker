"use client"

import { Card } from "@/components/ui/card"
import { FocusArea } from "@/lib/types/onboarding"
import { TrendingUp, Target, Users, Briefcase, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface FocusAreasStepProps {
  selected: FocusArea[]
  onToggle: (area: FocusArea) => void
}

const focusAreas = [
  {
    value: "income_expenses" as FocusArea,
    label: "Income & Expenses",
    description: "Track all money in and out",
    icon: TrendingUp,
    color: "text-blue-500",
  },
  {
    value: "budgets_goals" as FocusArea,
    label: "Budgets & Goals",
    description: "Plan spending and save for goals",
    icon: Target,
    color: "text-purple-500",
  },
  {
    value: "shared_household" as FocusArea,
    label: "Shared Household Expenses",
    description: "Manage family or roommate finances",
    icon: Users,
    color: "text-green-500",
  },
  {
    value: "business_transactions" as FocusArea,
    label: "Business Transactions",
    description: "Track business income and expenses",
    icon: Briefcase,
    color: "text-orange-500",
  },
  {
    value: "daily_spending" as FocusArea,
    label: "Daily Spending Only",
    description: "Simple expense tracking",
    icon: ShoppingCart,
    color: "text-pink-500",
  },
]

export default function FocusAreasStep({ selected, onToggle }: FocusAreasStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What do you want to track?</h2>
        <p className="text-muted-foreground">
          Select all that apply — you can change this later
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {focusAreas.map((area) => {
          const Icon = area.icon
          const isSelected = selected.includes(area.value)

          return (
            <Card
              key={area.value}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => onToggle(area.value)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg bg-muted", isSelected && "bg-primary/10")}>
                  <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : area.color)} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{area.label}</h3>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {selected.length} {selected.length === 1 ? "area" : "areas"} selected
        </p>
      )}
    </div>
  )
}
