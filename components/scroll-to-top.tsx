"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const pathname = usePathname()
  if (pathname.startsWith("/contacto")) return null
  return <ScrollToTopButton />
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform sm:bottom-20"
      aria-label="Volver al inicio"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}
