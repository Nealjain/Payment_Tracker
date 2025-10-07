"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import TextType from "@/components/ui/text-type"
import SharedBackground from "@/components/ui/shared-background"

const PIN_LENGTH = 4

type FlowType = "email" | "signin" | "signup"
type SignupStep = "password" | "phone" | "pin" | "username"

export default function AuthPage() {
  // Unified flow state
  const [flowType, setFlowType] = useState<FlowType>("email")
  const [signupStep, setSignupStep] = useState<SignupStep>("password")
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">("password")
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  // Clear any cached auth state on mount
  useEffect(() => {
    // Force clear any cached form data
    setEmail("")
    setPassword("")
    setPin("")
    setUsername("")
    setPhoneNumber("")
    setConfirmPassword("")
    setConfirmPin("")
    setFlowType("email")
    setSignupStep("password")
    setLoginMethod("password")
  }, [])

  // Check if email exists and route to signin or signup
  const handleEmailCheck = async () => {
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result = await response.json()

      if (result.exists) {
        // Email exists - show sign in
        setFlowType("signin")
      } else {
        // New email - show sign up
        setFlowType("signup")
        setSignupStep("password")
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setFlowType("email")
    setPassword("")
    setConfirmPassword("")
    setPin("")
    setConfirmPin("")
    setUsername("")
    setPhoneNumber("")
    setSignupStep("password")
    setLoginMethod("password")
  }

  // Sign in handler
  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email.trim(),
          password: loginMethod === "password" ? password : undefined,
          pin: loginMethod === "pin" ? pin : undefined,
          loginMethod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Welcome back!", description: "Successfully signed in" })
        router.push("/dashboard")
      } else {
        toast({ title: "Sign in failed", description: result.error || "Invalid credentials", variant: "destructive" })
        setPassword("")
        setPin("")
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Signup step navigation
  const handleSignupNext = () => {
    if (signupStep === "password") {
      if (!password || password.length < 8) {
        toast({ title: "Password too short", description: "Password must be at least 8 characters", variant: "destructive" })
        return
      }
      if (password !== confirmPassword) {
        toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same", variant: "destructive" })
        return
      }
      setSignupStep("phone")
    } else if (signupStep === "phone") {
      if (!phoneNumber || phoneNumber.length < 10) {
        toast({ title: "Invalid phone number", description: "Please enter a valid phone number", variant: "destructive" })
        return
      }
      setSignupStep("pin")
    } else if (signupStep === "pin") {
      if (pin.length !== PIN_LENGTH) {
        toast({ title: "Invalid PIN", description: "PIN must be exactly 4 digits", variant: "destructive" })
        return
      }
      if (pin !== confirmPin) {
        toast({ title: "PINs don't match", description: "Please make sure both PINs are the same", variant: "destructive" })
        return
      }
      setSignupStep("username")
    }
  }

  const handleSignupBack = () => {
    if (signupStep === "password") handleBackToEmail()
    else if (signupStep === "phone") setSignupStep("password")
    else if (signupStep === "pin") setSignupStep("phone")
    else if (signupStep === "username") setSignupStep("pin")
  }

  // Sign up handler
  const handleSignUp = async () => {
    if (!username.trim()) {
      toast({ title: "Username required", description: "Please enter a username", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          username: username.trim(),
          phoneNumber: phoneNumber.trim(),
          pin,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Account created!", description: "You can now sign in" })
        // Reset to sign in
        setFlowType("signin")
        setPassword("")
        setConfirmPassword("")
        setUsername("")
        setPhoneNumber("")
        setPin("")
        setConfirmPin("")
      } else {
        toast({ title: "Sign up failed", description: result.error || "Failed to create account", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      <SharedBackground />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-lg relative z-10">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold">
            <TextType
              text="Welcome to PayDhan"
              typingSpeed={100}
              pauseDuration={3000}
              showCursor={true}
              cursorCharacter="|"
              loop={false}
              className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            />
          </CardTitle>
          <CardDescription className="text-base">
            {flowType === "email" && "Enter your email to get started"}
            {flowType === "signin" && "Welcome back! Sign in to continue"}
            {flowType === "signup" && "Create your account"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Email Input - First Step */}
          {flowType === "email" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleEmailCheck()}
                  disabled={isLoading}
                  autoFocus
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  We'll check if you're new or returning
                </p>
              </div>

              <Button
                onClick={handleEmailCheck}
                className="w-full h-12 text-base font-medium"
                disabled={!email.trim() || isLoading}
              >
                {isLoading ? "Checking..." : "Continue"}
              </Button>
            </>
          )}

          {/* Sign In Flow */}
          {flowType === "signin" && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Signing in as:</span>
                <span className="font-medium">{email}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={loginMethod === "password" ? "default" : "outline"}
                  onClick={() => {
                    setLoginMethod("password")
                    setPin("")
                  }}
                  className="flex-1"
                >
                  Password
                </Button>
                <Button
                  variant={loginMethod === "pin" ? "default" : "outline"}
                  onClick={() => {
                    setLoginMethod("pin")
                    setPassword("")
                  }}
                  className="flex-1"
                >
                  PIN
                </Button>
              </div>

              {loginMethod === "password" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && password && handleSignIn()}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>4-Digit PIN</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPin(!showPin)}
                      className="h-8 w-8 p-0"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    type={showPin ? "text" : "password"}
                    placeholder="Enter your PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                      setPin(value)
                    }}
                    maxLength={PIN_LENGTH}
                    onKeyPress={(e) => e.key === "Enter" && pin.length === PIN_LENGTH && handleSignIn()}
                    autoFocus
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBackToEmail} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSignIn}
                  className="flex-1"
                  disabled={loginMethod === "password" ? !password : pin.length !== PIN_LENGTH}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/auth/forgot-pin")}
                  className="text-sm text-muted-foreground"
                >
                  Forgot credentials?
                </Button>
              </div>
            </>
          )}

          {/* Sign Up Flow */}
          {flowType === "signup" && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Creating account for:</span>
                <span className="font-medium">{email}</span>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-between">
                {["password", "phone", "pin", "username"].map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        signupStep === s
                          ? "bg-primary text-primary-foreground"
                          : ["password", "phone", "pin", "username"].indexOf(signupStep) > i
                          ? "bg-primary/50 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < 3 && (
                      <div
                        className={`h-1 flex-1 mx-1 rounded ${
                          ["password", "phone", "pin", "username"].indexOf(signupStep) > i
                            ? "bg-primary/50"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {signupStep === "password" && (
                <>
                  <div className="text-center mb-2">
                    <h3 className="font-semibold">Create Password</h3>
                    <p className="text-sm text-muted-foreground">Min 8 characters</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Password</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-8 w-8 p-0"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSignupNext()}
                      />
                      {password && confirmPassword && (
                        <p className={`text-sm ${password === confirmPassword ? "text-green-500" : "text-red-500"}`}>
                          {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {signupStep === "phone" && (
                <>
                  <div className="text-center mb-2">
                    <h3 className="font-semibold">Phone Number</h3>
                    <p className="text-sm text-muted-foreground">For account security</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <PhoneInput
                      defaultCountry="us"
                      value={phoneNumber}
                      onChange={(phone) => setPhoneNumber(phone)}
                      inputClassName="w-full"
                    />
                  </div>
                </>
              )}

              {signupStep === "pin" && (
                <>
                  <div className="text-center mb-2">
                    <h3 className="font-semibold">Create PIN</h3>
                    <p className="text-sm text-muted-foreground">4-digit PIN for quick access</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>PIN</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPin(!showPin)}
                          className="h-8 w-8 p-0"
                        >
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Input
                        type={showPin ? "text" : "password"}
                        placeholder="Enter 4 digits"
                        value={pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                          setPin(value)
                        }}
                        maxLength={PIN_LENGTH}
                        autoFocus
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm PIN</Label>
                      <Input
                        type={showPin ? "text" : "password"}
                        placeholder="Re-enter PIN"
                        value={confirmPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                          setConfirmPin(value)
                        }}
                        maxLength={PIN_LENGTH}
                        onKeyPress={(e) => e.key === "Enter" && handleSignupNext()}
                        className="text-center text-2xl tracking-widest"
                      />
                      {pin && confirmPin && (
                        <p className={`text-sm text-center ${pin === confirmPin ? "text-green-500" : "text-red-500"}`}>
                          {pin === confirmPin ? "✓ PINs match" : "✗ PINs don't match"}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {signupStep === "username" && (
                <>
                  <div className="text-center mb-2">
                    <h3 className="font-semibold">Choose Username</h3>
                    <p className="text-sm text-muted-foreground">Pick a unique username</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      placeholder="Choose username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && username.trim() && handleSignUp()}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Letters, numbers, and underscores only
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSignupBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {signupStep !== "username" ? (
                  <Button onClick={handleSignupNext} className="flex-1">
                    Continue
                  </Button>
                ) : (
                  <Button onClick={handleSignUp} className="flex-1" disabled={!username.trim() || isLoading}>
                    {isLoading ? "Creating..." : "Create Account"}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
