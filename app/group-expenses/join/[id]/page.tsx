"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, Check, X, Loader2 } from "lucide-react"
import SharedBackground from "@/components/ui/shared-background"

export default function JoinGroupPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.id as string

  const [group, setGroup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    fetchGroupInfo()
  }, [groupId])

  const fetchGroupInfo = async () => {
    try {
      // Try to load invite information (public)
      const response = await fetch(`/api/invites/${groupId}`)
      const result = await response.json()

      if (result.success) {
        setGroup(result.group)
        // If user is logged in, check membership
        try {
          const membersRes = await fetch(`/api/groups/${result.group.id}/members`, { credentials: 'include' })
          const membersData = await membersRes.json()

          if (membersData.success) {
            const userRes = await fetch("/api/auth/user", { credentials: 'include' })
            const userData = await userRes.json()

            if (userData.success && userData.user) {
              const isMember = membersData.members.some(
                (m: any) => m.user_id === userData.user.id
              )
              setAlreadyMember(isMember)
            }
          }
        } catch (e) {
          // ignore membership check errors for unauthenticated users
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Group not found or invite expired",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    setIsJoining(true)
    try {
      // Check if user is logged in
  const userRes = await fetch("/api/auth/user", { credentials: 'include' })
      const userData = await userRes.json()

      if (!userData.success || !userData.user) {
        toast({
          title: "Login Required",
          description: "Please login to join this group",
        })
        router.push(`/auth?redirect=/group-expenses/join/${groupId}`)
        return
      }

      // Join the group by adding as member
      // Accept invite via invites endpoint (requires auth)
      const response = await fetch(`/api/invites/${groupId}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'accept' }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success!",
          description: `You've joined ${group.name}`,
        })
        router.push(`/group-expenses/${groupId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join group",
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
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen relative">
        <SharedBackground />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="glass-card max-w-md w-full">
            <CardContent className="p-6 text-center">
              <X className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Group Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This group doesn't exist or the invite has expired
              </p>
              <Button onClick={() => router.push("/group-expenses")}>
                Go to Groups
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <SharedBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join Group</CardTitle>
            <CardDescription>
              You've been invited to join a group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Group Name</p>
                <p className="font-semibold text-lg">{group.name}</p>
              </div>
              {group.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{group.description}</p>
                </div>
              )}
            </div>

            {alreadyMember ? (
              <div className="text-center space-y-4">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                  <Check className="h-5 w-5 mx-auto mb-2" />
                  <p className="text-sm font-medium">You're already a member!</p>
                </div>
                <Button
                  onClick={() => router.push(`/group-expenses/${groupId}`)}
                  className="w-full"
                >
                  Go to Group
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className="w-full"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Join Group
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/group-expenses")}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
