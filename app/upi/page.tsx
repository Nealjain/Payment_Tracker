"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, CreditCard, Star, Copy, Check } from "lucide-react"
import SimpleBackground from "@/components/ui/simple-background"
import { UpiQRCode } from "@/components/upi-qr-code"
import type { UpiId } from "@/lib/types/upi"

export default function UpiPage() {
  const [upiIds, setUpiIds] = useState<UpiId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUpi, setEditingUpi] = useState<UpiId | null>(null)
  const [deleteUpi, setDeleteUpi] = useState<UpiId | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [upiId, setUpiId] = useState("")
  const [name, setName] = useState("")
  const [bankName, setBankName] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)

  useEffect(() => {
    fetchUpiIds()
  }, [])

  const fetchUpiIds = async () => {
    try {
      const response = await fetch("/api/upi")
      const result = await response.json()

      if (result.success) {
        setUpiIds(result.upiIds)
      } else {
        toast({
          title: "Error",
          description: "Failed to load UPI IDs",
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

  const handleSubmit = async () => {
    if (!upiId.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "UPI ID and name are required",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingUpi ? `/api/upi/${editingUpi.id}` : "/api/upi"
      const method = editingUpi ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upi_id: upiId,
          name,
          bank_name: bankName,
          is_primary: isPrimary,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: editingUpi ? "UPI ID updated" : "UPI ID added",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchUpiIds()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save UPI ID",
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

  const handleEdit = (upi: UpiId) => {
    setEditingUpi(upi)
    setUpiId(upi.upi_id)
    setName(upi.name)
    setBankName(upi.bank_name || "")
    setIsPrimary(upi.is_primary)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteUpi) return

    try {
      const response = await fetch(`/api/upi/${deleteUpi.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "UPI ID deleted",
        })
        setDeleteUpi(null)
        fetchUpiIds()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete UPI ID",
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

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      toast({
        title: "Copied!",
        description: "UPI ID copied to clipboard",
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy",
        variant: "destructive",
      })
    }
  }

  const handleSetPrimary = async (upi: UpiId) => {
    try {
      const response = await fetch(`/api/upi/${upi.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_primary: true }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Primary UPI ID updated",
        })
        fetchUpiIds()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update",
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

  const resetForm = () => {
    setUpiId("")
    setName("")
    setBankName("")
    setIsPrimary(false)
    setEditingUpi(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading UPI IDs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      <SimpleBackground />

      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">UPI Master</h1>
              <p className="text-muted-foreground">Manage your UPI IDs for quick payments</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add UPI ID
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-lg border-0">
                <DialogHeader>
                  <DialogTitle>{editingUpi ? "Edit UPI ID" : "Add New UPI ID"}</DialogTitle>
                  <DialogDescription>
                    {editingUpi ? "Update UPI ID details" : "Add a new UPI ID for quick access"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upi-id">UPI ID</Label>
                    <Input
                      id="upi-id"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@paytm"
                    />
                    <p className="text-xs text-muted-foreground">Format: username@provider</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Personal, Business"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank Name (Optional)</Label>
                    <Input
                      id="bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., HDFC, SBI, Paytm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="primary">Set as Primary</Label>
                    <Switch id="primary" checked={isPrimary} onCheckedChange={setIsPrimary} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>{editingUpi ? "Update" : "Add"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* UPI IDs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upiIds.map((upi) => (
              <Card key={upi.id} className="bg-card/95 backdrop-blur-lg border-0 relative">
                {upi.is_primary && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    {upi.name}
                  </CardTitle>
                  {upi.bank_name && (
                    <CardDescription>{upi.bank_name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <code className="flex-1 text-sm">{upi.upi_id}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(upi.upi_id)}
                    >
                      {copiedId === upi.upi_id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* QR Code Button */}
                  <div className="pt-2">
                    <UpiQRCode upiId={upi.upi_id} name={upi.name} />
                  </div>

                  <div className="flex gap-2">
                    {!upi.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSetPrimary(upi)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(upi)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleteUpi(upi)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {upiIds.length === 0 && (
              <Card className="col-span-full bg-card/95 backdrop-blur-lg border-0">
                <CardContent className="p-12 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No UPI IDs yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first UPI ID to get started</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add UPI ID
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUpi} onOpenChange={() => setDeleteUpi(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-lg border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete UPI ID?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteUpi?.name}" ({deleteUpi?.upi_id})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
