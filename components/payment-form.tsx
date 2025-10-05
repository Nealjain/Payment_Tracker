"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Payment, PaymentFormData } from "@/lib/types"

interface PaymentFormProps {
  payment?: Payment
  onSubmit: (data: PaymentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PaymentForm({ payment, onSubmit, onCancel, isLoading = false }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: payment?.amount || 0,
    type: payment?.type || "cash",
    direction: payment?.direction || "outgoing",
    description: payment?.description || "",
    category: payment?.category || "",
    date: payment?.date || new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{payment ? "Edit Payment" : "Add Payment"}</CardTitle>
        <CardDescription>{payment ? "Update payment details" : "Record a new income or expense"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Type</Label>
              <Select
                value={formData.direction}
                onValueChange={(value: "incoming" | "outgoing") => handleInputChange("direction", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Income</SelectItem>
                  <SelectItem value="outgoing">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Method</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "cash" | "online") => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Food, Transport, Salary"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : payment ? "Update" : "Add Payment"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
