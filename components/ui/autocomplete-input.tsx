"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AutocompleteInputProps {
  value: string
  onValueChange: (value: string) => void
  options: string[]
  placeholder?: string
  onAddNew?: (value: string) => void
  className?: string
}

export function AutocompleteInput({
  value,
  onValueChange,
  options,
  placeholder = "Type to search or add new...",
  onAddNew,
  className,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)
    onValueChange(newValue)
  }

  const handleSelectOption = (option: string) => {
    setInputValue(option)
    onValueChange(option)
    setIsOpen(false)
  }

  const handleAddNew = () => {
    if (inputValue.trim() && onAddNew) {
      onAddNew(inputValue.trim())
      setIsOpen(false)
    }
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const showAddNew = inputValue.trim() && !options.includes(inputValue) && onAddNew

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (filteredOptions.length > 0 || showAddNew) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.length > 0 && (
            <div className="py-1">
              {filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-accent flex items-center gap-2",
                    option === value && "bg-accent"
                  )}
                  onClick={() => handleSelectOption(option)}
                >
                  {option === value && <Check className="h-4 w-4" />}
                  <span className={option === value ? "font-medium" : ""}>{option}</span>
                </div>
              ))}
            </div>
          )}
          
          {showAddNew && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-accent border-t flex items-center gap-2 text-primary"
              onClick={handleAddNew}
            >
              <Plus className="h-4 w-4" />
              <span>Add "{inputValue}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
