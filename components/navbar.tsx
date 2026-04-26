"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, X, Gamepad2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLang } from "@/lib/i18n"

type NavItem =
  | { label: string; hash: string; href?: never }
  | { label: string; href: string; hash?: never }

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("home")
  const pathname = usePathname()
  const { lang, setLang, t } = useLang()

  const isHome = pathname === "/"

  const navItems: NavItem[] = [
    { label: t.nav.home, hash: "home" },
    { label: t.nav.about, hash: "about" },
    { label: t.nav.games, href: "/games" },
    { label: t.nav.projects, href: "/proyectos" },
    { label: t.nav.experience, hash: "experience" },
    { label: t.nav.skills, hash: "skills" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.contact, hash: "contact" },
  ]

  const resolveHref = (item: NavItem) => {
    if (item.href) return item.href
    return isHome ? `#${item.hash}` : `/#${item.hash}`
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Track active section based on scroll position (only on home page)
  useEffect(() => {
    if (!isHome) return

    const sectionIds = navItems
      .filter((item) => item.hash)
      .map((item) => item.hash as string)

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Trigger when section is in top 20-30% of viewport
      threshold: 0,
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [isHome])

  const isActive = (item: NavItem) => {
    // For page links, check pathname
    if (item.href) return pathname.startsWith(item.href)
    // For hash links on home page, check activeSection
    if (isHome && item.hash) return activeSection === item.hash
    return false
  }

  const toggleLang = () => setLang(lang === "es" ? "en" : "es")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href={isHome ? "#home" : "/"} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/30 group-hover:box-glow transition-all duration-300">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <span className="font-serif text-lg font-semibold tracking-tight hidden sm:block">
            <span className="text-primary">M</span>athías<span className="text-primary">.</span>dev
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={resolveHref(item)}
                className={`px-3 py-2 text-sm transition-colors duration-200 rounded-md hover:bg-primary/5 ${
                  isActive(item)
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {mounted && <ThemeToggle />}

          {/* Language Toggle */}
          {mounted && (
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-border/60 bg-muted/40 hover:bg-muted hover:border-primary/40 transition-all duration-200 shrink-0"
              aria-label={lang === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-xs font-semibold tracking-widest text-foreground">
                {lang.toUpperCase()}
              </span>
            </button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-9 w-9 lg:hidden rounded-md border border-border/50"
            aria-label="Menú"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <ul className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={resolveHref(item)}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-sm hover:bg-primary/5 rounded-md transition-colors ${
                    isActive(item)
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
