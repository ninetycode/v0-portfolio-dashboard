"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Briefcase, ChevronRight, BookOpen } from "lucide-react"
import { useLang } from "@/lib/i18n"

const experienceYears = ["2024", "2023", "2022", "2021", "2020"]
const experienceTypes: Array<"work" | "project" | "milestone"> = ["work", "project", "work", "milestone", "milestone"]
const experienceBlogPosts = ["post-mortem-roguelike", "ludum-dare-54", "primer-trabajo-gamedev", undefined, undefined]

export function ExperienceTimeline() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const { t } = useLang()
  const ex = t.experience

  const selectedExp = selectedIdx !== null ? ex.items[selectedIdx] : null
  const selectedType = selectedIdx !== null ? experienceTypes[selectedIdx] : null
  const selectedYear = selectedIdx !== null ? experienceYears[selectedIdx] : null
  const selectedBlog = selectedIdx !== null ? experienceBlogPosts[selectedIdx] : undefined

  return (
    <section id="experience" className="py-20 px-4 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/30">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{ex.title}</h2>
        </div>
        <p className="text-muted-foreground mb-12 max-w-2xl">{ex.subtitle}</p>

        <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-[var(--akane-mint-dim)]" />

            <div className="space-y-8">
              {ex.items.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-12 cursor-pointer group"
                  onClick={() => setSelectedIdx(index)}
                >
                  <div
                    className={`absolute left-0 top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedIdx === index
                        ? "border-primary bg-primary/20 scale-110"
                        : experienceTypes[index] === "work"
                        ? "border-primary bg-background group-hover:bg-primary/10"
                        : experienceTypes[index] === "project"
                        ? "border-accent bg-background group-hover:bg-accent/10"
                        : "border-[var(--akane-mint-dim)] bg-background group-hover:bg-[var(--akane-mint-dim)]/10"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">
                      {experienceYears[index].slice(-2)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-lg border transition-all duration-300 ${
                    selectedIdx === index
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-card/50 group-hover:border-primary/30"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif font-semibold group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground shrink-0">
                        {experienceYears[index]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedExp ? (
              <div className="p-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    selectedType === "work"
                      ? "bg-primary/10 text-primary"
                      : selectedType === "project"
                      ? "bg-accent/10 text-accent"
                      : "bg-[var(--akane-mint-dim)]/10 text-[var(--akane-mint-dim)]"
                  }`}>
                    {selectedType === "work" ? ex.typeWork : selectedType === "project" ? ex.typeProject : ex.typeMilestone}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">{selectedYear}</span>
                </div>

                <h3 className="font-serif text-2xl font-bold mb-2">{selectedExp.title}</h3>
                <p className="text-primary mb-4">{selectedExp.company}</p>
                <p className="text-muted-foreground mb-6">{selectedExp.overview}</p>

                <div className="space-y-3 mb-6">
                  <h4 className="font-mono text-sm text-muted-foreground">{ex.achievements}</h4>
                  <ul className="space-y-2">
                    {selectedExp.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedBlog && (
                  <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary" asChild>
                    <a href="/blog">
                      <BookOpen className="h-4 w-4" />
                      {ex.readMore}
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center text-center min-h-[300px]">
                <Briefcase className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">{ex.selectPrompt}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
