"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface TextTypeProps {
  text: string | string[]
  asElement?: keyof JSX.IntrinsicElements
  typingSpeed?: number
  initialDelay?: number
  pauseDuration?: number
  deletingSpeed?: number
  loop?: boolean
  className?: string
  showCursor?: boolean
  hideCursorWhileTyping?: boolean
  cursorCharacter?: string | React.ReactNode
  cursorBlinkDuration?: number
  cursorClassName?: string
  textColors?: string[]
  variableSpeed?: { min: number; max: number }
  onSentenceComplete?: (sentence: string, index: number) => void
  startOnVisible?: boolean
  reverseMode?: boolean
}

export default function TextType({
  text,
  asElement: Element = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.5,
  cursorClassName = "",
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
}: TextTypeProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVisible, setIsVisible] = useState(!startOnVisible)
  const elementRef = useRef<HTMLElement>(null)

  const texts = Array.isArray(text) ? text : [text]

  useEffect(() => {
    if (!startOnVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [startOnVisible])

  useEffect(() => {
    if (!isVisible) return

    let timeout: NodeJS.Timeout

    const getSpeed = () => {
      if (variableSpeed) {
        return Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min
      }
      return isDeleting ? deletingSpeed : typingSpeed
    }

    const currentText = texts[currentIndex]

    if (initialDelay && displayText === "" && currentIndex === 0) {
      timeout = setTimeout(() => {
        setDisplayText(reverseMode ? currentText[currentText.length - 1] : currentText[0])
      }, initialDelay)
      return () => clearTimeout(timeout)
    }

    if (!isDeleting && displayText === currentText) {
      if (onSentenceComplete) {
        onSentenceComplete(currentText, currentIndex)
      }

      if (!loop && currentIndex === texts.length - 1) {
        return
      }

      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, pauseDuration)
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false)
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    } else {
      timeout = setTimeout(() => {
        setDisplayText((prev) => {
          if (isDeleting) {
            return reverseMode ? prev.slice(1) : prev.slice(0, -1)
          } else {
            const nextChar = reverseMode
              ? currentText[currentText.length - prev.length - 1]
              : currentText[prev.length]
            return reverseMode ? nextChar + prev : prev + nextChar
          }
        })
      }, getSpeed())
    }

    return () => clearTimeout(timeout)
  }, [
    displayText,
    currentIndex,
    isDeleting,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
    initialDelay,
    variableSpeed,
    onSentenceComplete,
    isVisible,
    reverseMode,
  ])

  const textColor = textColors[currentIndex] || ""

  return (
    <Element ref={elementRef as any} className={cn("inline-block", className)}>
      <span style={{ color: textColor }}>{displayText}</span>
      {showCursor && (!hideCursorWhileTyping || isDeleting || displayText === texts[currentIndex]) && (
        <span
          className={cn("inline-block", cursorClassName)}
          style={{
            animation: `blink ${cursorBlinkDuration}s infinite`,
          }}
        >
          {cursorCharacter}
        </span>
      )}
      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </Element>
  )
}
