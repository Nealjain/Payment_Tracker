"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Plus, 
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3
} from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"simple" | "advanced">("simple")
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    groupExpenses: 0,
    groupsCount: 0,
    pendingPayments: 0,
  })
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [recentGroups, setRecentGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [paymentsRes, groupsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/groups")
      ])

      const paymentsData = await paymentsRes.json()
      const groupsData = await groupsRes.json()

      if (paymentsData.success) {
        const payments = paymentsData.payments || []
        const income = payments
          .filter((p: any) => p.type === "income")
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
        const expenses = payments
          .filter((p: any) => p.type === "expense")
          .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

        setStats(prev => ({
          ...prev,
          totalIncome: income,
          totalExpenses: expenses,
          netBalance: income - expenses,
        }))
        setRecentPayments(payments.slice(0, 5))
      }

      if (groupsData.success) {
        const groups = groupsData.groups || []
        setRecentGroups(groups.slice(0, 3))
        setStats(prev => ({
          ...prev,
          groupsCount: groups.length,
        }))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <SharedBackground />
      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Your financial overview</p>
            </div>
            <Button
              variant={viewMode === "advanced" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "simple" ? "advanced" : "simple")}
              className="gap-2"
            >
              {viewMode === "simple" ? <Zap className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              {viewMode === "simple" ? "Nerd Mode" : "Simple Mode"}
            </Button>
          </div>

          {viewMode === "simple" ? (
            <SimpleView stats={stats} recentPayments={recentPayments} recentGroups={recentGroups} router={router} />
          ) : (
            <AdvancedView stats={stats} recentPayments={recentPayments} recentGroups={recentGroups} router={router} />
          )}
        </div>
      </div>
    </div>
  )
}

function SimpleView({ stats, recentPayments, recentGroups, router }: any) {
  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.netBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">₹{stats.totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total earned</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">₹{stats.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => router.push("/payments")} className="h-20 flex-col gap-2">
          <Plus className="h-5 w-5" />
          Add Payment
        </Button>
        <Button onClick={() => router.push("/group-expenses")} variant="outline" className="h-20 flex-col gap-2">
          <Users className="h-5 w-5" />
          Groups ({stats.groupsCount})
        </Button>
        <Button onClick={() => router.push("/categories")} variant="outline" className="h-20 flex-col gap-2">
          <BarChart3 className="h-5 w-5" />
          Categories
        </Button>
        <Button onClick={() => router.push("/upi")} variant="outline" className="h-20 flex-col gap-2">
          <DollarSign className="h-5 w-5" />
          UPI IDs
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {payment.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${payment.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {payment.type === "income" ? "+" : "-"}₹{Number(payment.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No groups yet</p>
            ) : (
              <div className="space-y-3">
                {recentGroups.map((group: any) => (
                  <div
                    key={group.id}
                    onClick={() => router.push(`/group-expenses/${group.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{group.member_count || 0} members</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function AdvancedView({ stats, recentPayments, recentGroups, router }: any) {
  const incomeVsExpense = stats.totalIncome > 0 
    ? ((stats.totalExpenses / stats.totalIncome) * 100).toFixed(1)
    : 0

  const savingsRate = stats.totalIncome > 0
    ? (((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100).toFixed(1)
    : 0

  return (
    <>
      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              ₹{stats.netBalance.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">Income - Expenses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">₹{stats.totalIncome.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">All time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">₹{stats.totalExpenses.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-500">{incomeVsExpense}% of income</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{savingsRate}%</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                ₹{(stats.totalIncome - stats.totalExpenses).toFixed(2)} saved
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Stats */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Group Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Groups</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.groupsCount}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Group Expenses</span>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">₹{stats.groupExpenses.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pending Payments</span>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => router.push("/payments")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No payments recorded</p>
                <Button size="sm" onClick={() => router.push("/payments")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${payment.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        {payment.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{payment.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(payment.date).toLocaleDateString()}</span>
                          {payment.category && (
                            <>
                              <span>•</span>
                              <span>{payment.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${payment.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {payment.type === "income" ? "+" : "-"}₹{Number(payment.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Group Activity</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => router.push("/group-expenses")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No groups yet</p>
                <Button size="sm" onClick={() => router.push("/group-expenses")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentGroups.map((group: any) => (
                  <div
                    key={group.id}
                    onClick={() => router.push(`/group-expenses/${group.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{group.member_count || 0} members</span>
                          {group.description && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{group.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => router.push("/payments")} variant="outline" className="h-16 flex-col gap-1">
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Payment</span>
            </Button>
            <Button onClick={() => router.push("/group-expenses")} variant="outline" className="h-16 flex-col gap-1">
              <Users className="h-5 w-5" />
              <span className="text-xs">Manage Groups</span>
            </Button>
            <Button onClick={() => router.push("/categories")} variant="outline" className="h-16 flex-col gap-1">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Categories</span>
            </Button>
            <Button onClick={() => router.push("/upi")} variant="outline" className="h-16 flex-col gap-1">
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">UPI Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
