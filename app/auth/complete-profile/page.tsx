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
  const [existingData, setExistingData] = useState({
    hasUsername: false,
    hasPhone: false,
    hasPin: false,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    // Check for pending OAuth data first
    fetch("/api/auth/pending-oauth")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return

        if (data.success && data.data?.email) {
          // New OAuth user - needs to complete profile
          setUserEmail(data.data.email)
          // Suggest username from email
          setUsername(data.data.email.split("@")[0])
          setExistingData({
            hasUsername: false,
            hasPhone: false,
            hasPin: false,
          })
        } else {
          // Check if existing user with incomplete profile
          return fetch("/api/auth/user")
            .then((res) => res.json())
            .then((userData) => {
              if (!mounted) return

              if (userData.success && userData.data?.user) {
                const user = userData.data.user
                setUserEmail(user.email)
                
                // Check what data already exists
                const hasUsername = !!user.username && 
                  !user.username.startsWith("temp_") && 
                  user.username !== user.email?.split("@")[0]
                const hasPhone = !!user.phone_number
                const hasPin = user.hasPin
                
                setExistingData({
                  hasUsername,
                  hasPhone,
                  hasPin,
                })
                
                // Pre-fill existing data or suggest from email
                if (hasUsername) {
                  setUsername(user.username)
                } else if (user.email) {
                  setUsername(user.email.split("@")[0])
                }
                
                if (hasPhone) {
                  setPhoneNumber(user.phone_number)
                }
              } else {
                // No session or pending OAuth, redirect to auth after a delay
                console.log("No pending OAuth or session, redirecting to auth")
                setTimeout(() => {
                  if (mounted) router.push("/auth")
                }, 1000)
              }
            })
        }
      })
      .catch((error) => {
        console.error("Error loading profile data:", error)
        if (mounted) {
          // Don't redirect immediately on error, give user a chance to see what happened
          setTimeout(() => {
            if (mounted) router.push("/auth")
          }, 2000)
        }
      })

    return () => {
      mounted = false
    }
  }, [router])

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

  const missingFields = []
  if (!existingData.hasUsername) missingFields.push("Username")
  if (!existingData.hasPhone) missingFields.push("Phone Number")
  if (!existingData.hasPin) missingFields.push("Security PIN")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-black/50 backdrop-blur-sm">
      <SharedBackground />
      
      {/* Overlay to prevent clicking outside */}
      <div className="fixed inset-0 bg-black/60 z-40" />
      
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20 bg-card relative z-50 animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center space-y-3 border-b pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <span className="text-3xl">🔒</span>
          </div>
          <CardTitle className="text-2xl font-bold">Profile Required</CardTitle>
          <CardDescription>
            {userEmail && (
              <span className="block mb-2">
                Signed in as: <span className="font-medium text-primary">{userEmail}</span>
              </span>
            )}
            <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                ⚠️ You must complete your profile to use the app
              </p>
              {missingFields.length > 0 && (
                <>
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                    Required information:
                  </p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    {missingFields.map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username">Username {!existingData.hasUsername && <span className="text-red-500">*</span>}</Label>
              {existingData.hasUsername && <span className="text-xs text-green-500">✓ Set</span>}
            </div>
            <Input
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading || existingData.hasUsername}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">Phone Number {!existingData.hasPhone && <span className="text-red-500">*</span>}</Label>
              {existingData.hasPhone && <span className="text-xs text-green-500">✓ Set</span>}
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading || existingData.hasPhone}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US, +91 for India)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Create 4-Digit PIN {!existingData.hasPin && <span className="text-red-500">*</span>}</Label>
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
            <p className="text-xs text-muted-foreground">
              {pin.length > 0 && pin.length < PIN_LENGTH && (
                <span className="text-orange-500">Need {PIN_LENGTH - pin.length} more digit(s)</span>
              )}
              {pin.length === PIN_LENGTH && (
                <span className="text-green-500">✓ PIN complete</span>
              )}
              {pin.length === 0 && "This PIN will be used for quick authentication"}
            </p>
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
