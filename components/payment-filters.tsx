"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Calendar, DollarSign, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PaymentFilters {
  search: string
  type: "all" | "income" | "expense"
  direction: "all" | "in" | "out"
  category: string
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
  sortBy: "date" | "amount" | "category"
  sortOrder: "asc" | "desc"
}

interface PaymentFiltersProps {
  filters: PaymentFilters
  onFiltersChange: (filters: PaymentFilters) => void
  categories: string[]
  className?: string
}

export function PaymentFiltersComponent({ filters, onFiltersChange, categories, className }: PaymentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof PaymentFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
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
    setShowAdvanced(false)
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.type !== "all" ||
      filters.direction !== "all" ||
      filters.category ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.amountMin ||
      filters.amountMax
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== "all") count++
    if (filters.direction !== "all") count++
    if (filters.category) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.amountMin || filters.amountMax) count++
    return count
  }

  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, category..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.direction} onValueChange={(value) => updateFilter("direction", value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="incoming">Income</SelectItem>
              <SelectItem value="outgoing">Expenses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="amount">Sort by Amount</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Category
                </Label>
                <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  From Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  To Date
                </Label>
                <Input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} />
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Min Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={filters.amountMin}
                  onChange={(e) => updateFilter("amountMin", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Max Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={filters.amountMax}
                  onChange={(e) => updateFilter("amountMax", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
