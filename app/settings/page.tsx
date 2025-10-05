"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import { Trash2, Shield, User } from "lucide-react"
import PixelBlast from "@/components/ui/pixel-blast"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const router = useRouter()
  const { toast } = useToast()

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
        // Logout and redirect to auth
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
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setConfirmText("")
    }
  }

  return (
    <div className="min-h-screen bg-black animate-fade-in relative overflow-hidden">
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
      <BurgerMenu />

      <div className="p-4 pt-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              User Settings
            </h1>
            <p className="text-muted-foreground text-lg">Manage your account and data</p>
          </div>

          {/* Account Information */}
          <Card
            className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Storage</Label>
                <p className="text-sm text-muted-foreground">Your payment data is securely stored and encrypted</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card
            className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => router.push("/auth/forgot-pin")}
                className="w-full justify-start transition-all duration-200 hover:scale-[1.02]"
              >
                Change PIN
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card
            className="shadow-xl border-0 bg-card/80 backdrop-blur-sm border-red-200 dark:border-red-800 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-red-600 dark:text-red-400">Delete All Data</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will permanently delete all your payments, transactions, and account data. This action cannot
                    be undone.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
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
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        {isLoading ? "Deleting..." : "Delete All Data"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
