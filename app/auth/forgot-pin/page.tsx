"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PinKeypad } from "@/components/pin-keypad"
import { PinDisplay } from "@/components/pin-display"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

const PIN_LENGTH = 4

export default function ForgotPinPage() {
  const [step, setStep] = useState<"username" | "credential" | "newPin" | "confirmPin">("username")
  const [username, setUsername] = useState("")
  const [credential, setCredential] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length >= 3) {
      setStep("credential")
    }
  }

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (credential.length === 8) {
      setStep("newPin")
    }
  }

  const handleNumberPress = (number: string) => {
    const currentPin = step === "confirmPin" ? confirmPin : newPin
    if (currentPin.length < PIN_LENGTH) {
      if (step === "confirmPin") {
        setConfirmPin(currentPin + number)
      } else {
        setNewPin(currentPin + number)
      }
    }
  }

  const handleBackspace = () => {
    if (step === "confirmPin") {
      setConfirmPin(confirmPin.slice(0, -1))
    } else {
      setNewPin(newPin.slice(0, -1))
    }
  }

  const handleClear = () => {
    if (step === "confirmPin") {
      setConfirmPin("")
    } else {
      setNewPin("")
    }
  }

  const handlePinSubmit = async () => {
    if (step === "newPin") {
      if (newPin.length === PIN_LENGTH) {
        setStep("confirmPin")
      }
      return
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please try again.",
        variant: "destructive",
      })
      setConfirmPin("")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), credential, newPin }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "PIN reset successfully",
          description: "You can now sign in with your new PIN.",
        })
        router.push("/auth")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset PIN",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset PIN</CardTitle>
          <CardDescription>
            {step === "username" && "Enter your username to reset PIN"}
            {step === "credential" && "Enter your special credential to reset PIN"}
            {step === "newPin" && "Create a new 4-digit PIN"}
            {step === "confirmPin" && "Confirm your new PIN"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "username" ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={username.trim().length < 3}>
                Continue
              </Button>
            </form>
          ) : step === "credential" ? (
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credential">Special Credential</Label>
                <Input
                  id="credential"
                  type="password"
                  placeholder="Enter 8-digit credential"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  maxLength={8}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={credential.length !== 8}>
                Verify Credential
              </Button>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{step === "confirmPin" ? "Confirm PIN" : "New PIN"}</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPin(!showPin)}>
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <PinDisplay
                  pin={step === "confirmPin" ? confirmPin : newPin}
                  maxLength={PIN_LENGTH}
                  showPin={showPin}
                />
              </div>

              <PinKeypad onNumberPress={handleNumberPress} onBackspace={handleBackspace} onClear={handleClear} />

              {(step === "newPin" ? newPin : confirmPin).length === PIN_LENGTH && (
                <Button onClick={handlePinSubmit} className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Processing..." : step === "newPin" ? "Continue" : "Reset PIN"}
                </Button>
              )}
            </>
          )}

          <Button variant="link" onClick={() => router.push("/auth")} className="w-full text-sm text-muted-foreground">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
