"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  onAvailabilityChange?: (available: boolean | null) => void
  disabled?: boolean
  label?: string
  placeholder?: string
}

export function UsernameInput({
  value,
  onChange,
  onAvailabilityChange,
  disabled = false,
  label = "Username",
  placeholder = "Enter username",
}: UsernameInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (value.length < 3) {
      setIsAvailable(null)
      onAvailabilityChange?.(null)
      return
    }

    // Clear existing timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout)
    }

    const timeout = setTimeout(async () => {
      setIsChecking(true)
      try {
        const response = await fetch("/api/auth/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: value.trim() }),
        })

        const result = await response.json()
        setIsAvailable(result.available)
        onAvailabilityChange?.(result.available)
      } catch (error) {
        setIsAvailable(null)
        onAvailabilityChange?.(null)
      } finally {
        setIsChecking(false)
      }
    }, 300)

    setCheckTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [value, onAvailabilityChange])

  const getStatusIcon = () => {
    if (value.length < 3) return null
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    if (isAvailable === true) return <Check className="h-4 w-4 text-green-500 animate-scale-in" />
    if (isAvailable === false) return <X className="h-4 w-4 text-red-500 animate-scale-in" />
    return null
  }

  const getStatusMessage = () => {
    if (value.length < 3) return "Username must be at least 3 characters"
    if (isChecking) return "Checking availability..."
    if (isAvailable === true) return "Username is available"
    if (isAvailable === false) return "Username is already taken"
    return ""
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="username">{label}</Label>
      <div className="relative">
        <Input
          id="username"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "pr-10 transition-all duration-200 focus:scale-[1.02]",
            isAvailable === false && "border-red-500 focus-visible:ring-red-500",
            isAvailable === true && "border-green-500 focus-visible:ring-green-500",
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{getStatusIcon()}</div>
      </div>
      <p
        className={cn(
          "text-sm transition-colors duration-200",
          isAvailable === false && "text-red-500",
          isAvailable === true && "text-green-500",
          (isAvailable === null || isChecking) && "text-muted-foreground",
        )}
      >
        {getStatusMessage()}
      </p>
    </div>
  )
}
