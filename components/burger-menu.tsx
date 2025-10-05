"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Menu, Plus, Settings, LogOut, Home, CreditCard } from "lucide-react"

export function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
      router.push("/auth")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
    setIsOpen(false)
  }

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      onClick: () => {
        router.push("/dashboard")
        setIsOpen(false)
      },
    },
    {
      icon: Plus,
      label: "Add Payment",
      onClick: () => {
        router.push("/payments")
        setIsOpen(false)
      },
    },
    {
      icon: CreditCard,
      label: "View Payments",
      onClick: () => {
        router.push("/payments")
        setIsOpen(false)
      },
    },
    {
      icon: Settings,
      label: "User Settings",
      onClick: () => {
        router.push("/settings")
        setIsOpen(false)
      },
    },
  ]

  return (
    <div className="fixed top-4 left-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-card/95 backdrop-blur-sm border-0">
          <SheetHeader className="space-y-4">
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Expense Tracker
            </SheetTitle>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </SheetHeader>

          <div className="mt-8 space-y-2">
            {menuItems.map((item, index) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start h-12 text-base hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02]"
                onClick={item.onClick}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            ))}

            <div className="pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 hover:scale-[1.02]"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
