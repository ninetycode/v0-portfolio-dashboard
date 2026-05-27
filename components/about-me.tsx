"use client"

import { Gamepad2, Code, Target, Trophy } from "lucide-react"
import { useLang } from "@/lib/i18n"

export function AboutMe() {
  const { t } = useLang()
  const about = t.about

  const stats = [
    {
      icon: Gamepad2,
      title: about.stat1Title,
      description: about.stat1Desc,
    },
    {
      icon: Code,
      title: about.stat2Title,
      description: about.stat2Desc,
    },
    {
      icon: Target,
      title: about.stat3Title,
      description: about.stat3Desc,
    },
    {
      icon: Trophy,
      title: about.stat4Title,
      description: about.stat4Desc,
    },
  ]

  return (
    <section id="about" className="py-20 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 items-start">

          {/* Left: Label + Heading + Text + Stats (all together) */}
          <div>
            <p className="font-mono text-sm text-primary mb-4 tracking-widest uppercase">
              {about.label}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">
              {about.titlePart1}{" "}
              <span className="text-primary">{about.titleYear}</span>
            </h2>
          </div>

          {/* Right: empty top — cards will come below in full-width row */}
          <div className="hidden lg:block" />

          {/* Body text — spans left col */}
          <div className="space-y-6 text-muted-foreground leading-relaxed lg:-mt-4">
            <p>{about.paragraph1}</p>
            <p>{about.paragraph2}</p>
            <p>{about.paragraph3}</p>
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
