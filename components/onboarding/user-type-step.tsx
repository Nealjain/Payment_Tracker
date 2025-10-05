"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserType } from "@/lib/types/onboarding"
import { Briefcase, Code, Home, GraduationCap, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserTypeStepProps {
  selected: UserType | null
  onSelect: (type: UserType) => void
}

const userTypes = [
  {
    value: "professional" as UserType,
    label: "Working Professional",
    description: "Salaried employee with regular income",
    icon: Briefcase,
    color: "text-blue-500",
  },
  {
    value: "freelancer" as UserType,
    label: "Freelancer / Business Owner",
    description: "Self-employed or running a business",
    icon: Code,
    color: "text-purple-500",
  },
  {
    value: "homemaker" as UserType,
    label: "Homemaker / Household Manager",
    description: "Managing household finances",
    icon: Home,
    color: "text-green-500",
  },
  {
    value: "student" as UserType,
    label: "Student",
    description: "Managing allowance or part-time income",
    icon: GraduationCap,
    color: "text-orange-500",
  },
  {
    value: "retired" as UserType,
    label: "Retired",
    description: "Managing pension or retirement funds",
    icon: Users,
    color: "text-gray-500",
  },
  {
    value: "other" as UserType,
    label: "Other",
    description: "None of the above",
    icon: User,
    color: "text-gray-400",
  },
]

export default function UserTypeStep({ selected, onSelect }: UserTypeStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Which best describes you?</h2>
        <p className="text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {userTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selected === type.value

          return (
            <Card
              key={type.value}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => onSelect(type.value)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg bg-muted", isSelected && "bg-primary/10")}>
                  <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : type.color)} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
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
    </div>
  )
}
