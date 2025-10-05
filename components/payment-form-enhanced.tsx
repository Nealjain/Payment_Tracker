"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Payment, PaymentFormData } from "@/lib/types"
import type { Category } from "@/lib/types/categories"

interface PaymentFormEnhancedProps {
  payment?: Payment
  onSubmit: (data: PaymentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PaymentFormEnhanced({ payment, onSubmit, onCancel, isLoading = false }: PaymentFormEnhancedProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: payment?.amount || 0,
    type: payment?.type || "expense",
    direction: payment?.direction || "out",
    description: payment?.description || "",
    category: payment?.category || "",
    date: payment?.date || new Date().toISOString().split("T")[0],
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#B19EEF")
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [formData.type])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?type=${formData.type}`)
      const result = await response.json()
      if (result.success) {
        setCategories(result.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          type: formData.type,
          color: newCategoryColor,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Category created",
        })
        setFormData((prev) => ({ ...prev, category: newCategoryName }))
        setShowAddCategory(false)
        setNewCategoryName("")
        setNewCategoryColor("#B19EEF")
        fetchCategories()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create category",
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

  return (
    <>
      <Card className="w-full bg-card/95 backdrop-blur-lg border-0">
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

            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") => {
                  handleInputChange("type", value)
                  handleInputChange("direction", value === "income" ? "in" : "out")
                  handleInputChange("category", "") // Reset category when type changes
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="relative">
                <Input
                  value={formData.category || ""}
                  onChange={(e) => {
                    handleInputChange("category", e.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => setOpen(true)}
                  placeholder="Type or select category..."
                  className="pr-10"
                />
                {formData.category && !categories.find(c => c.name.toLowerCase() === (formData.category || "").toLowerCase()) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 px-2"
                    onClick={() => {
                      setNewCategoryName(formData.category || "")
                      setShowAddCategory(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              {open && formData.category && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                  {categories
                    .filter((cat) => cat.name.toLowerCase().includes((formData.category || "").toLowerCase()))
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          handleInputChange("category", category.name)
                          setOpen(false)
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || "#B19EEF" }}
                        />
                        <span>{category.name}</span>
                      </div>
                    ))}
                  {categories.filter((cat) => cat.name.toLowerCase().includes((formData.category || "").toLowerCase())).length === 0 && (
                    <div className="p-3 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No matching category</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewCategoryName(formData.category || "")
                          setShowAddCategory(true)
                          setOpen(false)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add "{formData.category}"
                      </Button>
                    </div>
                  )}
                </div>
              )}
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

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="bg-card/95 backdrop-blur-lg border-0">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for {formData.type} transactions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Category Name</Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Groceries, Rent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="new-category-color"
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  placeholder="#B19EEF"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategory(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
