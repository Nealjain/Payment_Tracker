"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Shield, User, Eye, EyeOff, Mail, Phone, Key } from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"
import { PhoneInput } from "react-international-phone"
import "react-international-phone/style.css"

const PIN_LENGTH = 4

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Username form
  const [username, setUsername] = useState("")
  
  // Email form
  const [email, setEmail] = useState("")
  
  // Phone form
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // PIN form
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/user")
      const result = await response.json()
      if (result.user) {
        setUserInfo(result.user)
        setUsername(result.user.username || "")
        setEmail(result.user.email || "")
        setPhoneNumber(result.user.phone_number || "")
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error)
    }
  }

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/update-username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Username updated successfully",
        })
        fetchUserInfo()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update username",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email cannot be empty",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Email updated successfully",
        })
        fetchUserInfo()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Phone number cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/update-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Phone number updated successfully",
        })
        fetchUserInfo()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update phone number",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({
        title: "Error",
        description: "Please fill in all PIN fields",
        variant: "destructive",
      })
      return
    }

    if (newPin.length !== PIN_LENGTH) {
      toast({
        title: "Error",
        description: `PIN must be exactly ${PIN_LENGTH} digits`,
        variant: "destructive",
      })
      return
    }

    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "New PINs don't match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/update-pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPin,
          newPin,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "PIN updated successfully",
        })
        setCurrentPin("")
        setNewPin("")
        setConfirmPin("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update PIN",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAllData = async () => {
    if (confirmText !== "DELETE ALL") {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE ALL' to confirm",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/delete-all", {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Data deleted",
          description: "All your data has been permanently deleted",
        })
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/auth")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setConfirmText("")
    }
  }

  return (
    <div className="min-h-screen relative">
      <SharedBackground />
      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Username */}
              <Card className="bg-card/95 backdrop-blur-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Username
                  </CardTitle>
                  <CardDescription>Change your display name</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter new username"
                    />
                  </div>
                  <Button onClick={handleUpdateUsername} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Username"}
                  </Button>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="bg-card/95 backdrop-blur-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Address
                  </CardTitle>
                  <CardDescription>Update your email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter new email"
                    />
                  </div>
                  <Button onClick={handleUpdateEmail} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Email"}
                  </Button>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card className="bg-card/95 backdrop-blur-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Number
                  </CardTitle>
                  <CardDescription>Update your phone number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneInput
                      defaultCountry="us"
                      value={phoneNumber}
                      onChange={(phone) => setPhoneNumber(phone)}
                      className="phone-input-custom"
                    />
                  </div>
                  <Button onClick={handleUpdatePhone} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Phone"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              {/* Password */}
              <Card className="bg-card/95 backdrop-blur-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="h-8 w-8 p-0"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-password">New Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="h-8 w-8 p-0"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="h-8 w-8 p-0"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>

              {/* PIN */}
              <Card className="bg-card/95 backdrop-blur-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change PIN
                  </CardTitle>
                  <CardDescription>Update your 4-digit PIN for quick access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="current-pin">Current PIN</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        className="h-8 w-8 p-0"
                      >
                        {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      id="current-pin"
                      type={showCurrentPin ? "text" : "password"}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
                      placeholder="Enter current PIN"
                      maxLength={PIN_LENGTH}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-pin">New PIN</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="h-8 w-8 p-0"
                      >
                        {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      id="new-pin"
                      type={showNewPin ? "text" : "password"}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
                      placeholder="Enter new 4-digit PIN"
                      maxLength={PIN_LENGTH}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="h-8 w-8 p-0"
                      >
                        {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      id="confirm-pin"
                      type={showConfirmPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
                      placeholder="Confirm new PIN"
                      maxLength={PIN_LENGTH}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <Button onClick={handleUpdatePin} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update PIN"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="space-y-6">
              <Card className="bg-card/95 backdrop-blur-lg border-0 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Trash2 className="h-5 w-5" />
                    Delete All Data
                  </CardTitle>
                  <CardDescription>Permanently delete your account and all data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete all your payments, transactions, and account data. This action cannot be undone.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card/95 backdrop-blur-sm border-0">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 dark:text-red-400">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                          <p>This action cannot be undone. This will permanently delete all your:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Payment records</li>
                            <li>Transaction history</li>
                            <li>Account settings</li>
                            <li>All associated data</li>
                          </ul>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-delete">
                              Type <strong>DELETE ALL</strong> to confirm:
                            </Label>
                            <Input
                              id="confirm-delete"
                              value={confirmText}
                              onChange={(e) => setConfirmText(e.target.value)}
                              placeholder="DELETE ALL"
                              className="font-mono"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAllData}
                          disabled={confirmText !== "DELETE ALL" || isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isLoading ? "Deleting..." : "Delete All Data"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
