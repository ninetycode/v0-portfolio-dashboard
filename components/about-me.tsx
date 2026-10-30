"use client"

import { Gamepad2, Code, Target, Trophy } from "lucide-react"
import { useSiteLang } from "@/lib/site-content/context"
import { SectionEditLink } from "@/components/section-edit-link"
import type { AboutIcon } from "@/lib/site-content/types"

const statIcons: Record<AboutIcon, typeof Gamepad2> = {
  gamepad: Gamepad2,
  code: Code,
  target: Target,
  trophy: Trophy,
}

export function AboutMe({ gameCount }: { gameCount: number }) {
  const { tx, content } = useSiteLang()
  const about = content.about

  const stats = about.stats.map((stat) => ({
    icon: statIcons[stat.icon] ?? Gamepad2,
    title: stat.useGameCount ? `${gameCount} ${tx(stat.countSuffix)}` : tx(stat.title),
    description: tx(stat.description),
  }))

  return (
    <section id="about" className="py-20 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex justify-end">
          <SectionEditLink seccion="sobre" />
        </div>
        <div className="grid gap-12 lg:grid-cols-2 items-start">

          {/* Left: Label + Heading + Text + Stats (all together) */}
          <div>
            <p className="font-mono text-sm text-primary mb-4 tracking-widest uppercase">
              {tx(about.label)}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">
              {tx(about.titlePart1)}{" "}
              <span className="text-primary">{about.titleYear}</span>
            </h2>
          </div>

          {/* Right: empty top — cards will come below in full-width row */}
          <div className="hidden lg:block" />

          {/* Body text — spans left col */}
          <div className="space-y-6 text-muted-foreground leading-relaxed lg:-mt-4">
            {about.paragraphs.map((paragraph, index) => {
              const text = tx(paragraph)
              if (!text.trim()) return null
              return <p key={index} className="whitespace-pre-wrap">{text}</p>
            })}
          </div>

          {/* Stats Grid — spans right col, aligned with body text */}
          <div className="grid grid-cols-2 gap-4 lg:-mt-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors group"
              >
                <stat.icon className="h-8 w-8 text-primary mb-4 transition-transform duration-200 group-hover:scale-125" />
                <h3 className="font-bold text-lg mb-1">{stat.title}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
