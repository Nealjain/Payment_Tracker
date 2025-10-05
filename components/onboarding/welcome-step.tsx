"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Target, Shield } from "lucide-react"

interface WelcomeStepProps {
  onStart: () => void
  onSkip: () => void
}

export default function WelcomeStep({ onStart, onSkip }: WelcomeStepProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome to SmartPay
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Your personal finance assistant that adapts to your lifestyle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h3 className="font-semibold">Smart Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Track income, expenses, and goals in one place
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-2">
          <Target className="w-8 h-8 text-primary" />
          <h3 className="font-semibold">Personalized</h3>
          <p className="text-sm text-muted-foreground">
            Dashboard tailored to your financial needs
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-2">
          <Shield className="w-8 h-8 text-primary" />
          <h3 className="font-semibold">Secure</h3>
          <p className="text-sm text-muted-foreground">
            Your data is encrypted and private
          </p>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Let's set up your personalized experience in just 2 minutes
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onStart} size="lg" className="px-8">
            Start Setup
          </Button>
          <Button onClick={onSkip} variant="outline" size="lg">
            Skip for Now
          </Button>
        </div>
      </div>
    </div>
  )
}
