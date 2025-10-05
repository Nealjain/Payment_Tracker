"use client"

import { useState, useMemo } from "react"
import type { Payment } from "@/lib/types"
import type { PaymentFilters } from "@/components/payment-filters"

export function usePaymentFilters(payments: Payment[]) {
  const [filters, setFilters] = useState<PaymentFilters>({
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
  })

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    payments.forEach((payment) => {
      if (payment.category) {
        uniqueCategories.add(payment.category)
      }
    })
    return Array.from(uniqueCategories).sort()
  }, [payments])

  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (payment) =>
          payment.description?.toLowerCase().includes(searchLower) ||
          payment.category?.toLowerCase().includes(searchLower),
      )
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((payment) => payment.type === filters.type)
    }

    // Direction filter
    if (filters.direction !== "all") {
      filtered = filtered.filter((payment) => payment.direction === filters.direction)
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((payment) => payment.category === filters.category)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((payment) => payment.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filtered = filtered.filter((payment) => payment.date <= filters.dateTo)
    }

    // Amount range filter
    if (filters.amountMin) {
      const minAmount = Number.parseFloat(filters.amountMin)
      filtered = filtered.filter((payment) => Number(payment.amount) >= minAmount)
    }
    if (filters.amountMax) {
      const maxAmount = Number.parseFloat(filters.amountMax)
      filtered = filtered.filter((payment) => Number(payment.amount) <= maxAmount)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "amount":
          comparison = Number(a.amount) - Number(b.amount)
          break
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "")
          break
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [payments, filters])

  return {
    filters,
    setFilters,
    filteredPayments,
    categories,
    totalCount: payments.length,
    filteredCount: filteredPayments.length,
  }
}
