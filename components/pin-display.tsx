"use client"

import { cn } from "@/lib/utils"

interface PinDisplayProps {
  pin: string
  maxLength: number
  className?: string
  showPin?: boolean
}

export function PinDisplay({ pin, maxLength, className, showPin = false }: PinDisplayProps) {
  return (
    <div className={cn("flex justify-center gap-3 mb-8", className)}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-12 h-12 rounded-lg border-2 transition-colors flex items-center justify-center text-lg font-semibold",
            index < pin.length
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-transparent border-muted-foreground",
          )}
        >
          {index < pin.length && (showPin ? pin[index] : "•")}
        </div>
      ))}
    </div>
  )
}
