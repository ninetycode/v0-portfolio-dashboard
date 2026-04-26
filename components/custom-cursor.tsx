"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { useCursor } from "@/lib/cursor-context"

export function CustomCursor() {
  const { theme } = useTheme()
  const { glowEnabled } = useCursor()
  const [mounted, setMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  
  // Actual mouse position
  const mousePos = useRef({ x: 0, y: 0 })
  // Follower position (lerped)
  const followerPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync follower position to current mouse when glow is re-enabled
  useEffect(() => {
    if (glowEnabled && followerRef.current) {
      // Instantly move follower to current mouse position
      followerPos.current = { ...mousePos.current }
      followerRef.current.style.left = `${mousePos.current.x}px`
      followerRef.current.style.top = `${mousePos.current.y}px`
    }
  }, [glowEnabled])

  useEffect(() => {
    if (!mounted) return

    const cursor = cursorRef.current
    const follower = followerRef.current
    if (!cursor || !follower) return

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      setIsVisible(true)
      
      // Update cursor position immediately
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    // Check for hoverable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'
      
      setIsHovering(isClickable)
    }

    // Lerp animation for follower
    let animationId: number
    const animate = () => {
      const lerp = 0.15
      
      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * lerp
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * lerp
      
      follower.style.left = `${followerPos.current.x}px`
      follower.style.top = `${followerPos.current.y}px`
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseover', handleMouseOver)

    // Hide default cursor globally
    document.body.style.cursor = 'none'
    const style = document.createElement('style')
    style.id = 'custom-cursor-style'
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animationId)
      document.body.style.cursor = ''
      const styleEl = document.getElementById('custom-cursor-style')
      if (styleEl) styleEl.remove()
    }
  }, [mounted])

  if (!mounted) return null

  const isDark = theme === 'dark'

  // Match exactly the --primary CSS variable used by buttons in each mode.
  // Light: oklch(0.4318 0.0709 257.7737) — slate-blue
  // Dark:  oklch(0.8818 0.0755 140.3035) — mint-green
  const primaryColor   = isDark ? '#86efac' : '#3d5a9e'
  const secondaryColor = isDark ? '#4ade80' : '#2a4080'
  const glowColor      = isDark ? 'rgba(134, 239, 172, 0.35)' : 'rgba(61, 90, 158, 0.35)'
  const glowColorHover = isDark ? 'rgba(134, 239, 172, 0.5)'  : 'rgba(61, 90, 158, 0.5)'

  return (
    <>
      {/* Follower - soft glowing orb with lerp, behind all content */}
      <div
        ref={followerRef}
        className="fixed pointer-events-none z-[1] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: isVisible && glowEnabled ? 0.9 : 0,
          width: isHovering ? '280px' : '200px',
          height: isHovering ? '280px' : '200px',
          background: `radial-gradient(circle, ${isHovering ? glowColorHover : glowColor} 0%, ${isHovering ? glowColorHover.replace('0.5', '0.15') : glowColor.replace('0.35', '0.08')} 35%, transparent 65%)`,
          borderRadius: '50%',
          filter: `blur(${isHovering ? '25px' : '20px'})`,
          transition: 'width 0.3s ease-out, height 0.3s ease-out, opacity 0.2s, filter 0.3s ease-out',
        }}
      />

      {/* Main cursor - pixel art style */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.1s',
        }}
      >
        {/* Pixel art cursor using CSS */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 16 16"
          style={{ 
            imageRendering: 'pixelated',
            filter: `drop-shadow(1px 1px 0px rgba(0,0,0,0.3))`,
          }}
        >
          {/* Classic arrow cursor - white outline */}
          <rect x="0" y="0" width="2" height="2" fill="#ffffff" />
          <rect x="0" y="2" width="2" height="2" fill="#ffffff" />
          <rect x="0" y="4" width="2" height="2" fill="#ffffff" />
          <rect x="0" y="6" width="2" height="2" fill="#ffffff" />
          <rect x="0" y="8" width="2" height="2" fill="#ffffff" />
          <rect x="0" y="10" width="2" height="2" fill="#ffffff" />
          <rect x="0" y="12" width="2" height="2" fill="#ffffff" />
          <rect x="2" y="12" width="2" height="2" fill="#ffffff" />
          <rect x="2" y="2" width="2" height="2" fill="#ffffff" />
          
          {/* Inner fill - solid color */}
          <rect x="2" y="4" width="2" height="2" fill={primaryColor} />
          <rect x="2" y="6" width="2" height="2" fill={primaryColor} />
          <rect x="2" y="8" width="2" height="2" fill={primaryColor} />
          <rect x="2" y="10" width="2" height="2" fill={primaryColor} />
          
          {/* Second column */}
          <rect x="4" y="4" width="2" height="2" fill="#ffffff" />
          <rect x="4" y="6" width="2" height="2" fill={primaryColor} />
          <rect x="4" y="8" width="2" height="2" fill={primaryColor} />
          <rect x="4" y="10" width="2" height="2" fill={primaryColor} />
          <rect x="4" y="12" width="2" height="2" fill="#ffffff" />
          
          {/* Third column */}
          <rect x="6" y="6" width="2" height="2" fill="#ffffff" />
          <rect x="6" y="8" width="2" height="2" fill={primaryColor} />
          <rect x="6" y="10" width="2" height="2" fill={primaryColor} />
          <rect x="6" y="12" width="2" height="2" fill="#ffffff" />
          
          {/* Fourth column */}
          <rect x="8" y="8" width="2" height="2" fill="#ffffff" />
          <rect x="8" y="10" width="2" height="2" fill={primaryColor} />
          <rect x="8" y="12" width="2" height="2" fill="#ffffff" />
          
          {/* Fifth column */}
          <rect x="10" y="10" width="2" height="2" fill="#ffffff" />
          <rect x="10" y="12" width="2" height="2" fill={primaryColor} />
          <rect x="10" y="14" width="2" height="2" fill="#ffffff" />
          
          {/* Sixth column - tip */}
          <rect x="12" y="12" width="2" height="2" fill="#ffffff" />
          <rect x="12" y="14" width="2" height="2" fill="#ffffff" />
          
          {/* Final tip */}
          <rect x="14" y="14" width="2" height="2" fill="#ffffff" />
        </svg>
      </div>
    </>
  )
}
