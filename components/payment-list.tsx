"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import type { Payment } from "@/lib/types"

interface PaymentListProps {
  payments: Payment[]
  onEdit: (payment: Payment) => void
  onDelete: (paymentId: string) => Promise<void>
  isLoading?: boolean
}

export function PaymentList({ payments, onEdit, onDelete, isLoading = false }: PaymentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (paymentId: string) => {
    setDeletingId(paymentId)
    try {
      await onDelete(paymentId)
    } finally {
      setDeletingId(null)
    }
  }

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
      year: "numeric",
    })
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">No payments recorded yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Add your first payment to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="transition-colors hover:bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                    <Badge variant="secondary" className="text-xs">
                      {payment.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(payment.date)}</span>
                    {payment.category && (
                      <>
                        <span>•</span>
                        <span>{payment.category}</span>
                      </>
                    )}
                  </div>

                  {payment.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">{payment.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(payment)} disabled={isLoading}>
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading || deletingId === payment.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this payment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(payment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
