"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { signInWithGoogle } from "@/lib/auth-client"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"
import TextType from "@/components/ui/text-type"
import PixelBlast from "@/components/ui/pixel-blast"

const PIN_LENGTH = 4

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin")
  const [step, setStep] = useState<"email" | "details">("email")
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">("password")
  
  // Form fields
  const [email, setEmail] = useState("")
  const [identifier, setIdentifier] = useState("") // Can be email or username
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        toast({
          title: "Sign in failed",
          description: result.error || "Failed to sign in with Google",
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

  const handleIdentifierCheck = async () => {
    if (activeTab === "signin") {
      // For sign in, accept email or username
      if (!identifier.trim()) {
        toast({
          title: "Required",
          description: "Please enter your email or username",
          variant: "destructive",
        })
        return
      }
      // Just proceed to next step for sign in
      setStep("details")
    } else {
      // For sign up, only accept email
      if (!email.trim()) {
        toast({
          title: "Email required",
          description: "Please enter your email address",
          variant: "destructive",
        })
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
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
          toast({
            title: "Email already registered",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          })
        } else {
          // Email available, show registration form
          setStep("details")
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
  }

  const handleSignIn = async () => {
    // Validate based on login method
    if (loginMethod === "password") {
      if (!identifier.trim() || !password) {
        toast({
          title: "Missing information",
          description: "Please enter your password",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!identifier.trim() || !pin || pin.length !== PIN_LENGTH) {
        toast({
          title: "Missing information",
          description: "Please enter your 4-digit PIN",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: loginMethod === "password" ? password : undefined,
          pin: loginMethod === "pin" ? pin : undefined,
          loginMethod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Sign in failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        })
        setPassword("")
        setPin("")
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



  const handleSignUp = async () => {
    // Validate all required fields
    if (!email.trim() || !password || !confirmPassword || !username.trim() || !phoneNumber.trim() || !pin || !confirmPin) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Validate password
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      })
      setConfirmPassword("")
      return
    }

    // Validate phone number (basic check - the component handles formatting)
    if (phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
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
      setConfirmPin("")
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
        toast({
          title: "Account created!",
          description: "You can now sign in",
        })
        setActiveTab("signin")
        setStep("email")
        // Clear signup fields
        setPassword("")
        setConfirmPassword("")
        setUsername("")
        setPhoneNumber("")
        setPin("")
        setConfirmPin("")
      } else {
        toast({
          title: "Sign up failed",
          description: result.error || "Failed to create account",
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



  const handleBack = () => {
    setStep("email")
    setPassword("")
    setConfirmPassword("")
    setPin("")
    setConfirmPin("")
  }

  const resetForm = () => {
    setStep("email")
    setEmail("")
    setIdentifier("")
    setPassword("")
    setConfirmPassword("")
    setUsername("")
    setPhoneNumber("")
    setPin("")
    setConfirmPin("")
  }

  const canProceedEmail = activeTab === "signin" ? identifier.trim() && !isLoading : email.trim() && !isLoading
  const canSignIn =
    loginMethod === "password"
      ? password && !isLoading
      : pin.length === PIN_LENGTH && !isLoading
  const canSignUp =
    password &&
    confirmPassword &&
    username.trim() &&
    phoneNumber.trim() &&
    pin.length === PIN_LENGTH &&
    confirmPin.length === PIN_LENGTH &&
    password === confirmPassword &&
    pin === confirmPin &&
    !isLoading

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black animate-fade-in relative overflow-hidden">
      {/* Animated Background */}
      <PixelBlast
        variant="circle"
        pixelSize={6}
        color="#B19EEF"
        patternScale={3}
        patternDensity={1.2}
        pixelSizeJitter={0.5}
        enableRipples
        rippleSpeed={0.4}
        rippleThickness={0.12}
        rippleIntensityScale={1.5}
        liquid
        liquidStrength={0.12}
        liquidRadius={1.2}
        liquidWobbleSpeed={5}
        speed={0.6}
        edgeFade={0.25}
        transparent
      />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-card/90 backdrop-blur-md animate-slide-up relative z-10">
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
          <CardDescription className="text-base">Your smart expense management companion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              resetForm()
            }}
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="signin" className="transition-all duration-200">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="transition-all duration-200">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-5 animate-fade-in">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign in with email</span>
                </div>
              </div>

              {step === "email" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signin-identifier">Email or Username</Label>
                    <Input
                      id="signin-identifier"
                      type="text"
                      placeholder="Enter your email or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleIdentifierCheck()}
                      disabled={isLoading}
                      autoFocus
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use either your email or username
                    </p>
                  </div>

                  <Button
                    onClick={handleIdentifierCheck}
                    className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!canProceedEmail}
                  >
                    {isLoading ? "Checking..." : "Continue"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Signing in as:</Label>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{identifier}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="h-8 text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm">Sign in with:</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
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
                        type="button"
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
                          className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && canSignIn && handleSignIn()}
                        disabled={isLoading}
                        autoFocus
                        className="transition-all duration-200 focus:scale-[1.02]"
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
                          className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                        >
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Input
                        type={showPin ? "text" : "password"}
                        placeholder="Enter your 4-digit PIN"
                        value={pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                          setPin(value)
                        }}
                        onKeyPress={(e) => e.key === "Enter" && canSignIn && handleSignIn()}
                        maxLength={PIN_LENGTH}
                        disabled={isLoading}
                        autoFocus
                        className="text-center text-lg tracking-widest transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSignIn}
                    className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!canSignIn}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => router.push("/auth/forgot-pin")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot {loginMethod === "password" ? "Password" : "PIN"}?
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-5 animate-fade-in">
              {/* Google Sign Up */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or create account</span>
                </div>
              </div>

              {step === "email" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleIdentifierCheck()}
                      disabled={isLoading}
                      autoFocus
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll check if this email is available
                    </p>
                  </div>

                  <Button
                    onClick={handleIdentifierCheck}
                    className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!canProceedEmail}
                  >
                    {isLoading ? "Checking..." : "Continue"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Creating account for:</Label>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="h-8 text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <PhoneInput
                      defaultCountry="us"
                      value={phoneNumber}
                      onChange={(phone) => setPhoneNumber(phone)}
                      disabled={isLoading}
                      inputClassName="w-full"
                      className="phone-input-custom"
                    />
                    <p className="text-xs text-muted-foreground">
                      Select your country and enter your phone number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Create Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Confirm Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    {password && confirmPassword && (
                      <p
                        className={`text-sm transition-colors duration-200 ${
                          password === confirmPassword ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                      </p>
                    )}
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
                    <p className="text-xs text-muted-foreground">For quick access to your account</p>
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
                    onClick={handleSignUp}
                    className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!canSignUp}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
