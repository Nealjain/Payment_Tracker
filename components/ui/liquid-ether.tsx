"use client"

import React, { useEffect, useRef } from "react"

interface LiquidEtherProps {
  colors?: string[]
  mouseForce?: number
  cursorSize?: number
  isViscous?: boolean
  viscous?: number
  iterationsViscous?: number
  iterationsPoisson?: number
  resolution?: number
  isBounce?: boolean
  autoDemo?: boolean
  autoSpeed?: number
  autoIntensity?: number
  takeoverDuration?: number
  autoResumeDelay?: number
  autoRampDuration?: number
  className?: string
  style?: React.CSSProperties
}

export default function LiquidEther({
  colors = ["#5227FF", "#FF9FFC", "#B19EEF"],
  mouseForce = 20,
  cursorSize = 100,
  resolution = 0.5,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  className = "",
  style = {},
}: LiquidEtherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let mouseX = 0
    let mouseY = 0
    let autoX = 0
    let autoY = 0
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * resolution
      canvas.height = canvas.offsetHeight * resolution
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = (e.clientX - rect.left) * resolution
      mouseY = (e.clientY - rect.top) * resolution
    }

    const animate = () => {
      time += 0.016

      if (autoDemo) {
        autoX = (Math.sin(time * autoSpeed) * canvas.width * 0.4) + canvas.width / 2
        autoY = (Math.cos(time * autoSpeed * 0.7) * canvas.height * 0.4) + canvas.height / 2
      }

      const x = mouseX || autoX
      const y = mouseY || autoY

      // Create multiple gradients for richer effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, cursorSize * resolution * autoIntensity)
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color)
      })

      // Draw with blend mode
      ctx.globalCompositeOperation = "lighter"
      ctx.fillStyle = gradient
      ctx.globalAlpha = 0.4
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Fade effect
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0, 0, 0, 0.015)"
      ctx.globalAlpha = 1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener("resize", resize)
    canvas.addEventListener("mousemove", handleMouseMove)
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [colors, mouseForce, cursorSize, resolution, autoDemo, autoSpeed, autoIntensity])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.8,
        zIndex: 0,
        ...style,
      }}
    />
  )
}
