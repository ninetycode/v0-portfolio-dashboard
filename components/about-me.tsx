"use client"

import { Gamepad2, Code, Target, Trophy } from "lucide-react"
import { useSiteLang } from "@/lib/site-content/context"
import { SectionEditLink } from "@/components/section-edit-link"
import { RichText } from "@/components/rich-text"
import { plainText } from "@/lib/site-content/rich-text"
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
    title: stat.useGameCount ? (
      <>
        {gameCount} <RichText value={tx(stat.countSuffix)} />
      </>
    ) : (
      <RichText value={tx(stat.title)} />
    ),
    description: tx(stat.description),
  }))

  return (
    <section id="about" className="scroll-mt-24 bg-background py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex justify-end">
          <SectionEditLink seccion="sobre" />
        </div>
        <div className="grid gap-12 lg:grid-cols-2 items-start">

          {/* Left: Label + Heading + Text + Stats (all together) */}
          <div data-reveal="rise">
            <p className="font-mono text-sm text-primary mb-4 tracking-widest uppercase">
              <RichText value={tx(about.label)} />
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">
              <RichText value={tx(about.titlePart1)} />{" "}
              <span className="text-primary"><RichText value={about.titleYear} /></span>
            </h2>
          </div>

          {/* Right: empty top — cards will come below in full-width row */}
          <div className="hidden lg:block" />

          {/* Body text — spans left col */}
          <div data-reveal="rise" className="space-y-6 text-muted-foreground leading-relaxed lg:-mt-4">
            {about.paragraphs.map((paragraph, index) => {
              const text = tx(paragraph)
              if (!plainText(text).trim() && !text.includes("<img")) return null
              return <p key={index} className="whitespace-pre-wrap"><RichText value={text} /></p>
            })}
          </div>

          {/* Stats Grid — spans right col, aligned with body text */}
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:-mt-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                data-reveal="pop"
                className="min-w-0 rounded-xl border border-border/50 bg-card p-4 transition-colors group hover:border-primary/30 sm:p-6"
              >
                <stat.icon className="mb-3 h-7 w-7 text-primary transition-transform duration-200 group-hover:scale-125 sm:mb-4 sm:h-8 sm:w-8" />
                <h3 className="mb-1 break-words text-base font-bold sm:text-lg">{stat.title}</h3>
                <p className="text-sm text-muted-foreground"><RichText value={stat.description} /></p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
