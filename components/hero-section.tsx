"use client"

import { ArrowDown, FolderKanban, Gamepad2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useSiteLang } from "@/lib/site-content/context"
import { siteConfig } from "@/lib/site-config"
import { AdminContentBar } from "@/components/admin-content-bar"
import { SectionEditLink } from "@/components/section-edit-link"
import { RichText } from "@/components/rich-text"
import { plainText } from "@/lib/site-content/rich-text"

const ctaBase =
  "group h-12 gap-2.5 rounded-xl px-6 font-sans text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 sm:min-w-44"
const ctaPrimary =
  "bg-primary text-highlight shadow-lg shadow-primary/20 hover:bg-highlight hover:text-highlight-foreground hover:shadow-xl hover:shadow-highlight/40"
const ctaSurface =
  "border-border bg-card/70 text-foreground shadow-sm hover:border-highlight hover:bg-highlight/10 hover:text-foreground hover:shadow-md hover:shadow-highlight/10 dark:border-border dark:bg-card/70 dark:hover:border-highlight dark:hover:bg-highlight/10"

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
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 md:pt-20 pb-16">
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
          <span className="font-mono text-xs text-primary"><RichText value={tx(h.badge)} /></span>
        </div>

        {/* Profile Image */}
        <div className="relative mx-auto mb-8 h-48 w-48 md:h-60 md:w-60">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-50 blur-xl animate-pulse" />
          <div className="relative h-full w-full rounded-full border-2 border-primary/50 overflow-hidden bg-muted">
            <Image
              src="/profile-avatar.jpg"
              alt={siteConfig.name}
              fill
              sizes="(min-width: 768px) 240px, 192px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-balance">
          <RichText value={tx(h.title1)} />{" "}
          <span className="text-primary"><RichText value={tx(h.title2)} /></span>
          <br />
          <RichText value={tx(h.title3)} />
        </h1>

        {/* Subtitle */}
        <p className="mb-2 text-balance font-sans text-lg text-muted-foreground md:text-xl">
          <RichText value={tx(h.subtitle)} />
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 font-mono text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> <RichText value={tx(h.classLabel)} />
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> <RichText value={tx(h.spec)} />
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> <RichText value={tx(h.rank)} />
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="text-primary">{">>"}</span> <RichText value={tx(h.region)} />
          </span>
        </div>

        {/* CTA Buttons: same size, type and icon slot; hierarchy comes from fill only */}
        <div className="mx-auto mb-12 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            asChild
            size="lg"
            className={`${ctaBase} ${ctaPrimary}`}
          >
            <a href="/games">
              <Gamepad2 className="size-5" aria-hidden="true" />
              <RichText value={tx(h.ctaGames)} />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className={`${ctaBase} ${ctaSurface}`}
          >
            <a href="/proyectos">
              <FolderKanban className="size-5 text-primary transition-colors group-hover:text-highlight" aria-hidden="true" />
              <RichText value={tx(h.ctaProjects)} />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className={`${ctaBase} ${ctaSurface}`}
          >
            <a href="#contact">
              <Mail className="size-5 text-primary transition-colors group-hover:text-highlight" aria-hidden="true" />
              <RichText value={tx(h.ctaContact)} />
            </a>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#about"
          onClick={handleScrollToAbout}
          className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer pb-4 md:pb-0"
          aria-label={plainText(tx(h.scrollDown))}
        >
          <span className="font-mono text-xs"><RichText value={tx(h.scrollDown)} /></span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
        </div>
      </div>
    </section>
  )
}
