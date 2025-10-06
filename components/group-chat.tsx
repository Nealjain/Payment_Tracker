"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, Pencil, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  message: string
  created_at: string
  edited_at?: string | null
  user_id: string
  users: {
    username: string
  }
}

interface GroupChatProps {
  groupId: string
  currentUserId: string
}

export function GroupChat({ groupId, currentUserId }: GroupChatProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)
  const isUserScrollingRef = useRef(false)
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch messages (silent background refresh)
  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setIsLoadingMessages(true)
    
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        cache: 'no-store',
      })
      const result = await response.json()

      if (result.success) {
        const newMessages = result.messages || []
        
        // Only update if messages actually changed (prevents unnecessary re-renders)
        const messagesChanged = JSON.stringify(newMessages) !== JSON.stringify(messages)
        
        if (messagesChanged) {
          setMessages(newMessages)
          
          // Auto-scroll to bottom only if user is not manually scrolling up
          // AND new messages were added
          const hasNewMessages = newMessages.length > lastMessageCountRef.current
          if (!isUserScrollingRef.current && hasNewMessages) {
            setTimeout(() => {
              chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
              })
            }, 100)
          }
          
          lastMessageCountRef.current = newMessages.length
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      if (showLoading) setIsLoadingMessages(false)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingMessage) return

    setIsSendingMessage(true)
    const messageToSend = newMessage.trim()
    setNewMessage("") // Clear input immediately for better UX

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      })

      const result = await response.json()

      if (result.success) {
        // Immediately fetch messages to show the new one
        await fetchMessages(false)
        
        // Scroll to bottom
        setTimeout(() => {
          chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        })
        setNewMessage(messageToSend) // Restore message on error
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
      setNewMessage(messageToSend) // Restore message on error
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingMessageId) {
        handleEditMessage()
      } else {
        handleSendMessage()
      }
    }
  }

  // Edit message
  const handleEditMessage = async () => {
    if (!editingText.trim() || !editingMessageId) return

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: editingMessageId, message: editingText.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setEditingMessageId(null)
        setEditingText("")
        await fetchMessages(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to edit message",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      })
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages?messageId=${messageId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchMessages(false)
        toast({
          title: "Message deleted",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete message",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  // Check if message can be edited/deleted (within 1 minute)
  const canEditDelete = (createdAt: string) => {
    const messageAge = Date.now() - new Date(createdAt).getTime()
    return messageAge < 60000
  }

  // Detect if user is manually scrolling
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      isUserScrollingRef.current = !isAtBottom
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-refresh every 5 seconds (background, non-intrusive)
  useEffect(() => {
    // Initial load
    fetchMessages(true)
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchMessages(false) // Silent refresh
    }, 5000)
    autoRefreshIntervalRef.current = interval
    
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
        autoRefreshIntervalRef.current = null
      }
    }
  }, [groupId])

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 rounded-lg"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_id === currentUserId
            const canEdit = isOwnMessage && canEditDelete(msg.created_at)
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 relative group ${
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.users?.username || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${isOwnMessage ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {msg.edited_at && ' (edited)'}
                    </p>
                    {canEdit && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id)
                            setEditingText(msg.message)
                          }}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Message Input */}
      <div className="mt-4">
        {editingMessageId && (
          <div className="mb-2 p-2 bg-yellow-500/10 rounded flex items-center justify-between">
            <span className="text-sm text-yellow-600">Editing message...</span>
            <button
              onClick={() => {
                setEditingMessageId(null)
                setEditingText("")
              }}
              className="p-1 hover:bg-yellow-500/20 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
            value={editingMessageId ? editingText : newMessage}
            onChange={(e) => editingMessageId ? setEditingText(e.target.value) : setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSendingMessage}
            maxLength={1000}
          />
          <Button 
            onClick={editingMessageId ? handleEditMessage : handleSendMessage}
            disabled={editingMessageId ? !editingText.trim() : (!newMessage.trim() || isSendingMessage)}
          >
            {isSendingMessage ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : editingMessageId ? (
              'Update'
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </div>

    </div>
  )
}
