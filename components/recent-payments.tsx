"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Payment } from "@/lib/types"

interface RecentPaymentsProps {
  payments: Payment[]
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  const router = useRouter()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const recentPayments = payments.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest payments and income</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/payments")}>
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {recentPayments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <Button variant="outline" className="mt-2 bg-transparent" onClick={() => router.push("/payments")}>
              Add your first payment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      payment.direction === "in"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {payment.direction === "in" ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{payment.category || payment.description || "Payment"}</span>
                      <Badge variant="secondary" className="text-xs">
                        {payment.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    payment.direction === "in"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {payment.direction === "in" ? "+" : "-"}
                  {formatAmount(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
