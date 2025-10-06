"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"

const PIN_LENGTH = 4

export default function CompleteProfilePage() {
  const [username, setUsername] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get user info from session
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserEmail(data.user.email)
          // Pre-fill username from email if available
          if (!username) {
            setUsername(data.user.email?.split("@")[0] || "")
          }
        } else {
          // No session, redirect to auth
          router.push("/auth")
        }
      })
      .catch(() => {
        router.push("/auth")
      })
  }, [router, username])

  const handleSubmit = async () => {
    // Validate all fields
    if (!username.trim() || !phoneNumber.trim() || !pin || !confirmPin) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number (e.g., +1234567890)",
        variant: "destructive",
      })
      return
    }

    // Validate PIN
    if (pin.length !== PIN_LENGTH) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      })
      return
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure both PINs are the same",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          phoneNumber: phoneNumber.trim(),
          pin,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Profile completed!",
          description: "Welcome to Expense Tracker",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Failed to complete profile",
          description: result.error || "Please try again",
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

  const canSubmit =
    username.trim() &&
    phoneNumber.trim() &&
    pin.length === PIN_LENGTH &&
    confirmPin.length === PIN_LENGTH &&
    pin === confirmPin &&
    !isLoading

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <SharedBackground />
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-lg relative z-10">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            {userEmail && (
              <span className="block mb-2">
                Signed in as: <span className="font-medium">{userEmail}</span>
              </span>
            )}
            Please provide additional information to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Create 4-Digit PIN</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Input
              type={showPin ? "text" : "password"}
              placeholder="Create a 4-digit PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                setPin(value)
              }}
              maxLength={PIN_LENGTH}
              disabled={isLoading}
              className="text-center text-lg tracking-widest transition-all duration-200 focus:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground">This PIN will be used for quick authentication</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Confirm PIN</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
              >
                {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Input
              type={showConfirmPin ? "text" : "password"}
              placeholder="Confirm your 4-digit PIN"
              value={confirmPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                setConfirmPin(value)
              }}
              maxLength={PIN_LENGTH}
              disabled={isLoading}
              className="text-center text-lg tracking-widest transition-all duration-200 focus:scale-[1.02]"
            />
            {pin && confirmPin && (
              <p
                className={`text-sm transition-colors duration-200 ${
                  pin === confirmPin ? "text-green-500" : "text-red-500"
                }`}
              >
                {pin === confirmPin ? "PINs match" : "PINs don't match"}
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={!canSubmit}
          >
            {isLoading ? "Completing profile..." : "Complete Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
