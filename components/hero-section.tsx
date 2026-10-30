"use client"

import { ArrowDown, Gamepad } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useSiteLang } from "@/lib/site-content/context"
import { AdminContentBar } from "@/components/admin-content-bar"
import { SectionEditLink } from "@/components/section-edit-link"

export function HeroSection() {
  const { tx, content } = useSiteLang()
  const h = content.home

  const handleScrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 md:pt-20 pb-28 md:pb-20">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <AdminContentBar />
        <div className="relative text-center">
        <div className="absolute top-0 right-0 z-10">
          <SectionEditLink seccion="inicio" />
        </div>
        {/* Terminal-style welcome */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 mt-6 md:mt-4 mb-6">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs text-primary">{tx(h.badge)}</span>
        </div>

        {/* Profile Image */}
        <div className="relative mx-auto mb-8 h-48 w-48 md:h-60 md:w-60">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-50 blur-xl animate-pulse" />
          <div className="relative h-full w-full rounded-full border-2 border-primary/50 overflow-hidden bg-muted">
            <Image
              src="/profile-avatar.jpg"
              alt={tx(h.footerName)}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Level Badge */}
          <div className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background">
            <span className="font-mono text-sm font-bold text-primary">{h.level}</span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-balance">
          {tx(h.title1)}{" "}
          <span className="text-primary">{tx(h.title2)}</span>
          <br />
          {tx(h.title3)}
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-lg md:text-xl text-muted-foreground mb-2">
          {tx(h.subtitle)}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 font-mono text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> {tx(h.classLabel)}
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> {tx(h.spec)}
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> {tx(h.region)}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="gap-2 font-sans">
            <a href="/games">
              <Gamepad className="h-4 w-4" />
              {tx(h.ctaGames)}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 font-sans border-primary/30 hover:border-primary hover:bg-primary/5">
            <a href="/proyectos">
              {tx(h.ctaProjects)}
            </a>
          </Button>
        </div>

        {/* Contact Link */}
        <div className="flex items-center justify-center mb-6 md:mb-12">
          <Button asChild variant="ghost" size="sm" className="gap-2 font-mono text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
            <a href="#contact">
              {tx(h.ctaContact)}
            </a>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#about"
          onClick={handleScrollToAbout}
          className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer pb-4 md:pb-0"
          aria-label={tx(h.scrollDown)}
        >
          <span className="font-mono text-xs">{tx(h.scrollDown)}</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
        </div>
      </div>
    </section>
  )
}
