"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CursorContextType {
  glowEnabled: boolean
  setGlowEnabled: (enabled: boolean) => void
  toggleGlow: () => void
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)

const STORAGE_KEY = "cursor-glow-enabled"

export function CursorProvider({ children }: { children: ReactNode }) {
  const [glowEnabled, setGlowEnabledState] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setGlowEnabledState(stored === "true")
    }
  }, [])

  const setGlowEnabled = (enabled: boolean) => {
    setGlowEnabledState(enabled)
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, String(enabled))
    }
  }

  const toggleGlow = () => {
    setGlowEnabled(!glowEnabled)
  }

  return (
    <CursorContext.Provider value={{ glowEnabled, setGlowEnabled, toggleGlow }}>
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = useContext(CursorContext)
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider")
  }
  return context
}
