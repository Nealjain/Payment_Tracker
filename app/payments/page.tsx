"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PaymentForm } from "@/components/payment-form"
import { PaymentList } from "@/components/payment-list"
import { PaymentFiltersComponent, type PaymentFilters } from "@/components/payment-filters"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { Plus, List, Filter } from "lucide-react"
import type { Payment, PaymentFormData } from "@/lib/types"
import PixelBlast from "@/components/ui/pixel-blast"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const { toast } = useToast()
  const router = useRouter()

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
          description: "Failed to load payments",
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

  const handleAddPayment = async (data: PaymentFormData) => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment added successfully",
        })
        setShowForm(false)
        fetchPayments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePayment = async (data: PaymentFormData) => {
    if (!editingPayment) return

    try {
      const response = await fetch(`/api/payments/${editingPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment updated successfully",
        })
        setEditingPayment(null)
        setShowForm(false)
        fetchPayments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment deleted successfully",
        })
        fetchPayments()
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
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingPayment(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="text-muted-foreground">Manage your income and expenses</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="p-4 bg-card/95 backdrop-blur-lg">
              <PaymentFiltersComponent
                filters={{
                  search: "",
                  type: "all",
                  direction: "all",
                  category: "",
                  dateFrom: "",
                  dateTo: "",
                  amountMin: "",
                  amountMax: "",
                  sortBy: "date",
                  sortOrder: "desc",
                }}
                onFiltersChange={() => {}}
                categories={[]}
              />
            </Card>
          )}

          {/* Split View: Form and List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add/Edit Payment Form */}
            <div>
              <PaymentForm
                payment={editingPayment || undefined}
                onSubmit={editingPayment ? handleUpdatePayment : handleAddPayment}
                onCancel={handleCancelForm}
              />
            </div>

            {/* Payments List */}
            <div>
              <PaymentList
                payments={payments}
                onEdit={handleEdit}
                onDelete={handleDeletePayment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
