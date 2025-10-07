"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Plus,
  UserPlus,
  LogOut,
  Trash2,
  DollarSign,
  Calendar,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  Bell,
  MessageSquare,
  X,
  CheckCircle,
  XCircle
} from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"
import { UpiQRCode } from "@/components/upi-qr-code"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { GroupChat } from "@/components/group-chat"
import * as XLSX from "xlsx"

interface GroupMember {
  id: string
  user_id: string
  role: string
  users: {
    username: string
    email: string
  }
}

interface GroupExpense {
  id: string
  paid_by: string
  amount: number
  description: string
  category: string | null
  date: string
  split_method: string
  paid_by_user: {
    username: string
  }
  splits: {
    id: string
    user_id: string
    amount: number
    is_settled: boolean
    settled_at: string | null
    user: {
      username: string
    }
  }[]
}

interface Group {
  id: string
  name: string
  description: string | null
  created_by: string
  upi_id: string | null
  upi_name: string | null
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [expenses, setExpenses] = useState<GroupExpense[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [inviteDialog, setInviteDialog] = useState(false)
  const [expenseDialog, setExpenseDialog] = useState(false)
  const [shareDialog, setShareDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [chatDialog, setChatDialog] = useState(false)
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState<any>(null)

  // Form states
  const [inviteIdentifier, setInviteIdentifier] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseCategory, setExpenseCategory] = useState("")
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedUpiId, setSelectedUpiId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cash">("cash")

  // User's categories and UPI IDs
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [userUpiIds, setUserUpiIds] = useState<any[]>([])

  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState("")

  useEffect(() => {
    fetchGroupData()
    fetchCurrentUser()
    fetchUserCategories()
    fetchUserUpiIds()
  }, [groupId])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/user", { credentials: 'include' })
      const result = await response.json()
      if (result.success && result.user) {
        setCurrentUserId(result.user.id)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      // Helpful debug in case of auth/cookie issues
      try {
        // eslint-disable-next-line no-console
        console.debug('Fetch /api/auth/user failed, ensure session cookie is present in the browser (expense_tracker_session)')
      } catch {}
    }
  }

  const fetchUserCategories = async () => {
    try {
      const response = await fetch("/api/categories?type=expense", { credentials: 'include' })
      const result = await response.json()
      if (result.success) {
        setUserCategories(result.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchUserUpiIds = async () => {
    try {
      const response = await fetch("/api/upi", { credentials: 'include' })
      const result = await response.json()
      if (result.success) {
        setUserUpiIds(result.upiIds)
        // Set primary UPI as default
        const primary = result.upiIds.find((upi: any) => upi.is_primary)
        if (primary) {
          setSelectedUpiId(primary.upi_id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch UPI IDs:", error)
    }
  }

  const fetchGroupData = async () => {
    try {
      const [groupRes, membersRes, expensesRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`, { credentials: 'include' }),
        fetch(`/api/groups/${groupId}/members`, { credentials: 'include' }),
        fetch(`/api/groups/${groupId}/expenses`, { credentials: 'include' })
      ])

      const groupData = await groupRes.json()
      const membersData = await membersRes.json()
      const expensesData = await expensesRes.json()

      if (groupData.success) setGroup(groupData.group)
      if (membersData.success) setMembers(membersData.members)
      if (expensesData.success) setExpenses(expensesData.expenses)

      // Set all members as selected by default
      if (membersData.success) {
        setSelectedMembers(membersData.members.map((m: GroupMember) => m.user_id))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Please enter username or email",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ identifier: inviteIdentifier }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Invite sent successfully",
        })
        setInviteDialog(false)
        setInviteIdentifier("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send invite",
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

  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDescription || selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and select members",
        variant: "destructive",
      })
      return
    }

    try {
      const amount = parseFloat(expenseAmount)
      const splitAmount = amount / selectedMembers.length

      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description: expenseDescription,
          category: expenseCategory || null,
          date: expenseDate,
          due_date: dueDate || null,
          splitMethod: "equal",
          splits: selectedMembers.map(userId => ({
            user_id: userId,
            amount: splitAmount,
          })),
          payment_method: paymentMethod,
          upi_id: paymentMethod === "upi" ? selectedUpiId : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Expense added successfully",
        })
        setExpenseDialog(false)
        resetExpenseForm()
        fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add expense",
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

  const resetExpenseForm = () => {
    setExpenseAmount("")
    setExpenseDescription("")
    setExpenseCategory("")
    setExpenseDate(new Date().toISOString().split("T")[0])
    setSelectedMembers(members.map(m => m.user_id))
    setPaymentMethod("cash")
    setSelectedUpiId("")
  }

  const handleSendReminder = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/remind`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Reminder sent",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send reminder",
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

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Expense deleted",
        })
        fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete expense",
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

  const handleRequestPaymentApproval = async (splitId: string) => {
    try {
      const response = await fetch(`/api/expense-splits/${splitId}/request-approval`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment approval requested. Waiting for confirmation.",
        })
        setPaymentDialog(false)
        fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to request approval",
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

  const handleApprovePayment = async (splitId: string) => {
    try {
      const response = await fetch(`/api/expense-splits/${splitId}/approve`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Payment approved and marked as settled",
        })
        fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve payment",
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

  const handleRejectPayment = async (splitId: string) => {
    const reason = prompt("Reason for rejection (optional):")
    
    try {
      const response = await fetch(`/api/expense-splits/${splitId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Payment not received" }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Payment Rejected",
          description: "The member will be notified",
        })
        fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject payment",
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

  const handleSettleExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/settle`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Expense settled",
        })
        fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to settle expense",
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

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return

    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Left group successfully",
        })
        router.push("/group-expenses")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to leave group",
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

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/group-expenses/join/${groupId}`
    navigator.clipboard.writeText(link)
    setShareLink(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    })
  }

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleExportToExcel = () => {
    if (expenses.length === 0) {
      toast({
        title: "No data",
        description: "No expenses to export",
        variant: "destructive",
      })
      return
    }

    // Prepare data for Excel
    const excelData = expenses.flatMap(expense =>
      expense.splits.map(split => ({
        Date: new Date(expense.date).toLocaleDateString(),
        Description: expense.description,
        Category: expense.category || "N/A",
        "Total Amount": Number(expense.amount).toFixed(2),
        "Paid By": expense.paid_by_user.username,
        "Split With": split.user.username,
        "Split Amount": Number(split.amount).toFixed(2),
        Status: split.is_settled ? "Settled" : "Pending",
        "Settled Date": split.is_settled && split.settled_at
          ? new Date(split.settled_at).toLocaleDateString()
          : "N/A"
      }))
    )

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 30 }, // Description
      { wch: 15 }, // Category
      { wch: 12 }, // Total Amount
      { wch: 15 }, // Paid By
      { wch: 15 }, // Split With
      { wch: 12 }, // Split Amount
      { wch: 10 }, // Status
      { wch: 12 }, // Settled Date
    ]

    XLSX.utils.book_append_sheet(wb, ws, "Expenses")

    // Generate filename
    const filename = `${group?.name.replace(/\s+/g, "_")}_Expenses_${new Date().toISOString().split("T")[0]}.xlsx`

    // Download
    XLSX.writeFile(wb, filename)

    toast({
      title: "Success",
      description: "Expenses exported to Excel",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Group not found</p>
            <Button onClick={() => router.push("/group-expenses")} className="mt-4">
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine admin status by checking group creator or membership role
  const isAdmin = !!members.find(m => m.user_id === currentUserId && m.role === "admin") || group.created_by === currentUserId

  return (
    <div className="min-h-screen relative">
      <SharedBackground />
      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription className="mt-2">{group.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChatDialog(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportToExcel}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareDialog(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLeaveGroup}
                    className="text-red-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Members</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold">{members.length}</p>
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => setInviteDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">
                    ₹{expenses.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => setExpenseDialog(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            {isAdmin && (
              <Button onClick={() => setInviteDialog(true)} variant="outline" className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          {/* Members List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{member.users.username}</p>
                      <p className="text-sm text-muted-foreground">{member.users.email}</p>
                    </div>
                    {member.role === "admin" && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No expenses yet. Add your first expense!
                  </p>
                ) : (
                  expenses.map((expense) => {
                    const userSplit = expense.splits.find(s => s.user_id === currentUserId)
                    const isPayer = expense.paid_by === currentUserId

                    return (
                      <Card key={expense.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold">{expense.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                Paid by {expense.paid_by_user.username} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                              {expense.category && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded mt-1 inline-block">
                                  {expense.category}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">₹{Number(expense.amount).toFixed(2)}</p>
                              {userSplit && (
                                <p className="text-sm text-muted-foreground">
                                  Your share: ₹{Number(userSplit.amount).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Splits */}
                          <div className="space-y-2 mb-3">
                            {expense.splits.map((split) => (
                              <div
                                key={split.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{split.user.username}</span>
                                <div className="flex items-center gap-2">
                                  <span>₹{Number(split.amount).toFixed(2)}</span>
                                  {split.is_settled ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-xs text-orange-500">Pending</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {userSplit && !userSplit.is_settled && !isPayer && (
                              <>
                                {(userSplit as any).payment_requested_at ? (
                                  <div className="flex-1 text-center p-2 bg-yellow-500/10 rounded text-yellow-600 text-sm">
                                    ⏳ Waiting for {expense.paid_by_user.username} to confirm
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedExpenseForPayment({ expense, split: userSplit })
                                      setPaymentDialog(true)
                                    }}
                                    className="flex-1"
                                  >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Pay Now
                                  </Button>
                                )}
                              </>
                            )}
                            {isPayer && (
                              <>
                                {expense.splits.some((s: any) => s.payment_requested_at && !s.is_settled) && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      setSelectedExpenseForPayment({ expense, split: null })
                                      setPaymentDialog(true)
                                    }}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Review Payments
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendReminder(expense.id)}
                                >
                                  <Bell className="h-4 w-4 mr-1" />
                                  Remind
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Enter the username or email of the person you want to invite
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username or Email</Label>
              <Input
                value={inviteIdentifier}
                onChange={(e) => setInviteIdentifier(e.target.value)}
                placeholder="username or email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogContent className="glass-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Add a new expense and split it among members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Expense Date *</Label>
                <Input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground">
                When should members pay by? Leave empty for no deadline.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="What was this expense for?"
              />
            </div>

            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <AutocompleteInput
                value={expenseCategory}
                onValueChange={setExpenseCategory}
                options={userCategories.map(cat => cat.name)}
                placeholder="Type to search or add new category..."
                onAddNew={async (newCategory) => {
                  try {
                    const response = await fetch("/api/categories", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: newCategory,
                        type: "expense",
                        color: "#3b82f6",
                      }),
                    })
                    const result = await response.json()
                    if (result.success) {
                      setExpenseCategory(newCategory)
                      fetchUserCategories() // Refresh the list
                      toast({
                        title: "Category saved",
                        description: `"${newCategory}" has been added to your categories`,
                      })
                    } else {
                      toast({
                        title: "Error",
                        description: result.error || "Failed to save category",
                        variant: "destructive",
                      })
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to save category",
                      variant: "destructive",
                    })
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label>Select UPI ID</Label>
                <AutocompleteInput
                  value={selectedUpiId}
                  onValueChange={setSelectedUpiId}
                  options={userUpiIds.map(upi => upi.upi_id)}
                  placeholder="Type to search or add new UPI ID..."
                  onAddNew={async (newUpiId) => {
                    // Validate UPI ID format
                    const upiRegex = /^[\w.-]+@[\w.-]+$/
                    if (!upiRegex.test(newUpiId)) {
                      toast({
                        title: "Invalid UPI ID",
                        description: "Please enter a valid UPI ID (e.g., name@bank)",
                        variant: "destructive",
                      })
                      return
                    }

                    try {
                      const response = await fetch("/api/upi", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          upi_id: newUpiId,
                          name: "My UPI",
                          is_primary: userUpiIds.length === 0,
                        }),
                      })
                      const result = await response.json()
                      if (result.success) {
                        setSelectedUpiId(newUpiId)
                        fetchUserUpiIds() // Refresh the list
                        toast({
                          title: "UPI ID saved",
                          description: `"${newUpiId}" has been added to your UPI IDs`,
                        })
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
                        description: "Failed to save UPI ID",
                        variant: "destructive",
                      })
                    }
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Split Among (Select Members)</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.user_id}
                      checked={selectedMembers.includes(member.user_id)}
                      onCheckedChange={() => toggleMemberSelection(member.user_id)}
                    />
                    <label
                      htmlFor={member.user_id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {member.users.username}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Split equally among {selectedMembers.length} member(s) = ₹
                {expenseAmount ? (parseFloat(expenseAmount) / selectedMembers.length).toFixed(2) : "0.00"} each
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Share Group</DialogTitle>
            <DialogDescription>
              Share this link with others to invite them to the group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={shareLink || `${window.location.origin}/group-expenses/join/${groupId}`}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyShareLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedExpenseForPayment?.split ? "Make Payment" : "Review Payments"}
            </DialogTitle>
            <DialogDescription>
              {selectedExpenseForPayment?.split 
                ? "Complete payment and request approval"
                : "Approve or reject payment requests"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedExpenseForPayment?.split ? (
            /* Member paying */
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Amount to pay</p>
                <p className="text-3xl font-bold">
                  ₹{Number(selectedExpenseForPayment.split.amount).toFixed(2)}
                </p>
                <p className="text-sm">
                  to {selectedExpenseForPayment.expense.paid_by_user.username}
                </p>
              </div>

              {(selectedExpenseForPayment.expense as any).payer_upi_id && (
                <div className="flex justify-center">
                  <UpiQRCode
                    upiId={(selectedExpenseForPayment.expense as any).payer_upi_id}
                    name={selectedExpenseForPayment.expense.paid_by_user.username}
                    amount={Number(selectedExpenseForPayment.split.amount)}
                  />
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Payment Instructions:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Scan the QR code or use the UPI ID</li>
                  <li>Complete the payment</li>
                  <li>Click "Request Approval" below</li>
                  <li>Wait for {selectedExpenseForPayment.expense.paid_by_user.username} to confirm</li>
                </ol>
              </div>
            </div>
          ) : (
            /* Payer reviewing payments */
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedExpenseForPayment?.expense.splits
                .filter((s: any) => s.payment_requested_at && !s.is_settled)
                .map((split: any) => (
                  <Card key={split.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{split.user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{Number(split.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested {new Date(split.payment_requested_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePayment(split.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectPayment(split.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Didn't Receive
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              Close
            </Button>
            {selectedExpenseForPayment?.split && (
              <Button onClick={() => handleRequestPaymentApproval(selectedExpenseForPayment.split.id)}>
                Request Approval
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatDialog} onOpenChange={setChatDialog}>
        <DialogContent className="glass-card max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Group Chat</DialogTitle>
            <DialogDescription>
              Messages auto-delete after 30 days
            </DialogDescription>
          </DialogHeader>
          <GroupChat groupId={groupId} currentUserId={currentUserId} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
