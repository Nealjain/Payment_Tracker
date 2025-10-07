"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BurgerMenu } from "@/components/burger-menu"
import { useToast } from "@/hooks/use-toast"
import { Users, DollarSign, Plus, UserPlus, QrCode, Search } from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"
import { useRouter } from "next/navigation"
import type { Group } from "@/lib/types/groups"

export default function GroupExpensesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      const result = await response.json()

      console.log("👥 Fetch groups response:", result)

      if (result.success) {
        setGroups(result.groups || [])
      } else {
        console.error("❌ Failed to load groups:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to load groups",
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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      })
      return
    }

    try {
      // Get userId from localStorage as workaround
      const userId = localStorage.getItem("userId")
      
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": userId || "" // Send userId in header as backup
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Group created successfully",
        })
        setIsDialogOpen(false)
        setGroupName("")
        setGroupDescription("")
        fetchGroups()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create group",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <SharedBackground />

      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Group Expenses</h1>
                <p className="text-muted-foreground">Split bills and track shared expenses</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card/95 backdrop-blur-lg border-0">
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a group to split expenses with friends, family, or roommates
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g., Roommates, Trip to Goa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-description">Description (Optional)</Label>
                      <Textarea
                        id="group-description"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        placeholder="What's this group for?"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGroup}>Create Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Groups List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(groups || [])
              .filter((group) =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((group) => (
                <Card
                  key={group.id}
                  className="bg-card/95 backdrop-blur-lg border-0 hover:bg-card/90 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/group-expenses/${group.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {group.name}
                    </CardTitle>
                    {group.description && (
                      <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-semibold">{group.member_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Expenses</span>
                      <span className="font-semibold">₹{(group.total_expenses || 0).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {groups.length === 0 && (
              <Card className="col-span-full bg-card/95 backdrop-blur-lg border-0">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first group to start splitting expenses
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
