"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ArrowLeft, Shield, Trash2, UserCog, RefreshCw } from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.id as string

  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [groupId])

  const fetchData = async () => {
    try {
      const [userRes, groupRes, membersRes] = await Promise.all([
        fetch("/api/auth/user"),
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/members`)
      ])

      const userData = await userRes.json()
      const groupData = await groupRes.json()
      const membersData = await membersRes.json()

      if (userData.success && userData.user) {
        setCurrentUserId(userData.user.id)
      }

      if (groupData.success) {
        setGroup(groupData.group)
        setGroupName(groupData.group.name)
        setGroupDescription(groupData.group.description || "")
        setIsAdmin(groupData.group.created_by === userData.user?.id)
      }

      if (membersData.success) {
        setMembers(membersData.members)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Group updated" })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      })
    }
  }

  const handleChangeMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: `Member role updated to ${newRole}` })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Member removed" })
        setMemberToRemove(null)
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Group deleted" })
        router.push("/group-expenses")
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Only admins can access group settings</p>
            <Button onClick={() => router.push(`/group-expenses/${groupId}`)}>
              Back to Group
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <SharedBackground />
      <BurgerMenu />

      <div className="p-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/group-expenses/${groupId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Group Settings</h1>
              <p className="text-muted-foreground">Manage your group</p>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Group Information</CardTitle>
              <CardDescription>Update group name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateGroup}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Group
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Members & Roles</CardTitle>
              <CardDescription>Manage member permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{member.users.username}</p>
                      <p className="text-sm text-muted-foreground">{member.users.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.user_id !== group.created_by ? (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleChangeMemberRole(member.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.users.username} from this group?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRemoveMember(memberToRemove?.id)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and all its expenses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-500 hover:bg-red-600">
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
