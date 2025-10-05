"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/stats-card"
import { RecentPayments } from "@/components/recent-payments"
import { ExpenseChart } from "@/components/expense-chart"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, PieChart } from "lucide-react"
import TextType from "@/components/ui/text-type"
import PixelBlast from "@/components/ui/pixel-blast"
import type { Payment } from "@/lib/types"

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  outstandingDues: number
}

interface UserInfo {
  username: string
  email: string
}

export default function DashboardPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    outstandingDues: 0,
  })
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/user")
      const result = await response.json()
      if (result.user) {
        setUserInfo(result.user)
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [paymentsResponse, statsResponse] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/payments/stats"),
      ])

      const paymentsResult = await paymentsResponse.json()
      const statsResult = await statsResponse.json()

      if (paymentsResult.success) {
        setPayments(paymentsResult.payments)
      }

      if (statsResult.success) {
        setStats(statsResult.stats)
      }

      if (!paymentsResult.success || !statsResult.success) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while loading dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background */}
      <div className="fixed inset-0 w-full h-full">
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
      </div>

      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">
                <TextType
                  text={userInfo ? `Welcome ${userInfo.username}` : "Welcome to PayDhan"}
                  typingSpeed={75}
                  pauseDuration={3000}
                  showCursor={true}
                  cursorCharacter="|"
                  loop={false}
                  className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                />
              </h1>
              <p className="text-muted-foreground text-lg">Here's your financial overview</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <StatsCard
                title="Total Income"
                value={formatCurrency(stats.totalIncome)}
                icon={TrendingUp}
                valueClassName="text-green-600 dark:text-green-400"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <StatsCard
                title="Total Expenses"
                value={formatCurrency(stats.totalExpenses)}
                icon={TrendingDown}
                valueClassName="text-red-600 dark:text-red-400"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <StatsCard
                title="Net Balance"
                value={formatCurrency(stats.netBalance)}
                icon={DollarSign}
                valueClassName={
                  stats.netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <StatsCard
                title="Outstanding Dues"
                value={formatCurrency(stats.outstandingDues)}
                icon={CreditCard}
                valueClassName="text-orange-600 dark:text-orange-400"
              />
            </div>
          </div>

          {/* Charts and Recent Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <RecentPayments payments={payments} />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <ExpenseChart payments={payments} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.7s" }}>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => router.push("/payments")}
            >
              <Plus className="h-6 w-6" />
              <span>Add Payment</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => router.push("/payments")}
            >
              <PieChart className="h-6 w-6" />
              <span>View All Payments</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              disabled
            >
              <TrendingUp className="h-6 w-6" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
