"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PinKeypadProps {
  onNumberPress: (number: string) => void
  onBackspace: () => void
  onClear: () => void
  className?: string
}

export function PinKeypad({ onNumberPress, onBackspace, onClear, className }: PinKeypadProps) {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

  return (
    <div className={cn("grid grid-cols-3 gap-4 max-w-xs mx-auto", className)}>
      {numbers.slice(0, 9).map((number) => (
        <Button
          key={number}
          variant="outline"
          size="lg"
          className="h-16 text-2xl font-semibold bg-transparent"
          onClick={() => onNumberPress(number)}
        >
          {number}
        </Button>
      ))}

      <Button variant="outline" size="lg" className="h-16 text-lg bg-transparent" onClick={onClear}>
        Clear
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="h-16 text-2xl font-semibold bg-transparent"
        onClick={() => onNumberPress("0")}
      >
        0
      </Button>

      <Button variant="outline" size="lg" className="h-16 text-lg bg-transparent" onClick={onBackspace}>
        ⌫
      </Button>
    </div>
  )
}
