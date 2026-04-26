"use client"

import { Newspaper } from "lucide-react"
import { useLang } from "@/lib/i18n"

export function BlogHero() {
  const { t } = useLang()
  const tb = t.blog

  return (
    <section className="relative pt-24 pb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div 
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 mb-6 animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
          >
            <Newspaper className="h-8 w-8 text-primary" />
          </div>

          {/* Title */}
          <h1 
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <span className="text-foreground">Dev</span>
            <span className="text-primary">Blog</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="font-mono text-sm text-muted-foreground mb-4 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            {tb.heroSubtitle}
          </p>

          {/* Description */}
          <p 
            className="max-w-2xl text-muted-foreground leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            {tb.heroDescription}
          </p>

          {/* Stats */}
          <div 
            className="flex items-center gap-6 mt-8 font-mono text-sm animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">5 {tb.articles}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-muted-foreground">
              {tb.updatedWeekly} <span className="text-primary">{tb.weekly}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
