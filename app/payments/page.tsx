"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PaymentForm } from "@/components/payment-form"
import { PaymentList } from "@/components/payment-list"
import { PaymentFiltersComponent } from "@/components/payment-filters"
import { usePaymentFilters } from "@/hooks/use-payment-filters"
import { useToast } from "@/hooks/use-toast"
import { Plus, ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Payment, PaymentFormData } from "@/lib/types"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const { filters, setFilters, filteredPayments, categories, totalCount, filteredCount } = usePaymentFilters(payments)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      const result = await response.json()

      if (result.success) {
        setPayments(result.payments)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch payments",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching payments",
        variant: "destructive",
      })
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)
    try {
      const url = editingPayment ? `/api/payments/${editingPayment.id}` : "/api/payments"
      const method = editingPayment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: editingPayment ? "Payment updated successfully" : "Payment added successfully",
        })
        setShowForm(false)
        setEditingPayment(null)
        await fetchPayments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while saving payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleDelete = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment deleted successfully",
        })
        await fetchPayments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while deleting payment",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPayment(null)
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Amount", "Type", "Direction", "Category", "Description"].join(","),
      ...filteredPayments.map((payment) =>
        [
          payment.date,
          payment.amount,
          payment.type,
          payment.direction,
          payment.category || "",
          `"${payment.description || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `Exported ${filteredCount} payments to CSV`,
    })
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-sm text-muted-foreground">
                {filteredCount === totalCount ? `${totalCount} payments` : `${filteredCount} of ${totalCount} payments`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filteredPayments.length > 0 && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            )}
          </div>
        </div>

        {!showForm && (
          <PaymentFiltersComponent filters={filters} onFiltersChange={setFilters} categories={categories} />
        )}

        {showForm ? (
          <PaymentForm
            payment={editingPayment || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <PaymentList payments={filteredPayments} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
