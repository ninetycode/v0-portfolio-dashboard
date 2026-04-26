"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  
  // Wait for mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const isDark = resolvedTheme === "dark"

  const handleToggle = () => {
    if (isAnimating) return
    setIsAnimating(true)
    triggerPixelTransition(() => {
      setTheme(isDark ? "light" : "dark")
      setTimeout(() => setIsAnimating(false), 50)
    })
  }

  const triggerPixelTransition = (callback: () => void) => {
    const overlay = overlayRef.current
    if (!overlay) {
      callback()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      callback()
      return
    }

    // Get viewport dimensions
    const w = window.innerWidth
    const h = window.innerHeight
    
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      callback()
      return
    }

    // Chunky GameBoy-style pixels
    const PIXEL_SIZE = 24
    const cols = Math.ceil(w / PIXEL_SIZE)
    const rows = Math.ceil(h / PIXEL_SIZE)

    // Build completely random order for true retro "dissolve" effect
    const allPixels: { row: number; col: number }[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        allPixels.push({ row, col })
      }
    }
    
    // Fisher-Yates shuffle for true randomness
    for (let i = allPixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allPixels[i], allPixels[j]] = [allPixels[j], allPixels[i]]
    }

    const total = allPixels.length
    const fillColor = isDark ? "#f5f5f5" : "#1a1a2e"

    overlay.style.display = "block"
    ctx.clearRect(0, 0, w, h)
    
    // Disable image smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false

    // Use stepped animation (not every frame) for that "jumping" retro feel
    const TOTAL_DURATION = 350
    const STEPS = 12 // Number of discrete steps (like old hardware)
    const stepDuration = TOTAL_DURATION / STEPS
    let currentStep = 0
    let themeChanged = false
    
    // Track which pixels are filled
    const filledPixels = new Set<number>()

    const animateStep = () => {
      currentStep++
      const progress = currentStep / STEPS
      const targetFilled = Math.floor(progress * total)
      
      ctx.fillStyle = fillColor
      
      // Fill pixels up to target in one "jump"
      while (filledPixels.size < targetFilled && filledPixels.size < total) {
        const idx = filledPixels.size
        const { row, col } = allPixels[idx]
        ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
        filledPixels.add(idx)
      }

      // Change theme at ~50% coverage
      if (!themeChanged && progress >= 0.5) {
        themeChanged = true
        callback()
      }

      if (currentStep < STEPS) {
        setTimeout(animateStep, stepDuration)
      } else {
        // Fill any remaining
        while (filledPixels.size < total) {
          const idx = filledPixels.size
          const { row, col } = allPixels[idx]
          ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
          filledPixels.add(idx)
        }
        // Start reverse animation
        setTimeout(() => {
          reverseAnimation(canvas, ctx, allPixels, PIXEL_SIZE, overlay)
        }, 80)
      }
    }

    // Start first step
    setTimeout(animateStep, stepDuration)
  }

  const reverseAnimation = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    allPixels: { row: number; col: number }[],
    PIXEL_SIZE: number,
    overlay: HTMLDivElement
  ) => {
    const total = allPixels.length
    const TOTAL_DURATION = 300
    const STEPS = 10
    const stepDuration = TOTAL_DURATION / STEPS
    let currentStep = 0
    
    // Shuffle again for different reveal pattern
    const revealOrder = [...allPixels]
    for (let i = revealOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[revealOrder[i], revealOrder[j]] = [revealOrder[j], revealOrder[i]]
    }
    
    const clearedPixels = new Set<number>()

    const animateStep = () => {
      currentStep++
      const progress = currentStep / STEPS
      const targetCleared = Math.floor(progress * total)
      
      // Clear pixels in "jumps"
      while (clearedPixels.size < targetCleared && clearedPixels.size < total) {
        const idx = clearedPixels.size
        const { row, col } = revealOrder[idx]
        ctx.clearRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
        clearedPixels.add(idx)
      }

      if (currentStep < STEPS) {
        setTimeout(animateStep, stepDuration)
      } else {
        // Clear any remaining
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        overlay.style.display = "none"
      }
    }

    setTimeout(animateStep, stepDuration)
  }

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative inline-flex h-7 w-14 shrink-0 rounded-full border-2 bg-muted border-muted" />
    )
  }

  return (
    <>
      {/* Pixel transition overlay - covers entire page including scroll */}
      <div
        ref={overlayRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{ 
          display: "none",
          width: "100vw",
          height: "100vh",
          position: "fixed",
        }}
        aria-hidden="true"
      >
        <canvas 
          ref={canvasRef} 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Toggle switch */}
      <button
        onClick={handleToggle}
        disabled={isAnimating}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        aria-checked={isDark}
        role="switch"
        className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: isDark
            ? "oklch(0.8818 0.0755 140.3035)"
            : "oklch(0.8585 0.0200 260.1685)",
          borderColor: isDark
            ? "oklch(0.7638 0.0980 140.3035)"
            : "oklch(0.8585 0.0200 260.1685)",
        }}
      >
        <span
          className="pointer-events-none flex h-5 w-5 items-center justify-center rounded-full shadow-md ring-0 transition-transform duration-300"
          style={{
            transform: isDark ? "translateX(1.75rem)" : "translateX(0.1rem)",
            backgroundColor: isDark ? "oklch(0.2864 0.0489 289.7403)" : "#ffffff",
          }}
        >
          {isDark ? (
            <Moon
              className="h-3 w-3"
              style={{ color: "oklch(0.8818 0.0755 140.3035)" }}
              strokeWidth={2.5}
            />
          ) : (
            <Sun
              className="h-3 w-3 text-amber-500"
              strokeWidth={2.5}
            />
          )}
        </span>
      </button>
    </>
  )
}
