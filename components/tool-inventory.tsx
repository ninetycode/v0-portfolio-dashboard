"use client"

import { useState, useEffect } from "react"
import { Wrench, BookOpen, GitBranch, Table2, Code } from "lucide-react"
import { useTheme } from "next-themes"
import { useSiteLang } from "@/lib/site-content/context"
import { SectionEditLink } from "@/components/section-edit-link"
import { RichText } from "@/components/rich-text"
import type { LucideTool, ToolIcon } from "@/lib/site-content/types"

const lucideIcons: Record<LucideTool, typeof Wrench> = {
  book: BookOpen,
  table: Table2,
  wrench: Wrench,
  code: Code,
  git: GitBranch,
}

function ToolGlyph({ icon, color }: { icon: ToolIcon; color: string }) {
  if (icon.type === "lucide") {
    const Icon = lucideIcons[icon.name] ?? Wrench
    return <Icon className="h-6 w-6" style={{ color }} />
  }
  if (!icon.slug) return <Wrench className="h-6 w-6" style={{ color }} />
  return (
    <img
      src={`https://cdn.simpleicons.org/${icon.slug}/${color.replace("#", "")}`}
      alt=""
      aria-hidden="true"
      className="h-7 w-7 object-contain"
    />
  )
}

export function ToolInventory() {
  const { tx, content } = useSiteLang()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const tl = content.tools

  useEffect(() => {
    setMounted(true)
  }, [])

  const toolColor = !mounted ? "#86efac" : resolvedTheme === "dark" ? "#86efac" : "#478cbf"

  return (
    <section id="tools" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div data-reveal="rise" className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
            <Wrench className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold"><RichText value={tx(tl.title)} /></h2>
          <SectionEditLink seccion="herramientas" />
        </div>
        <p data-reveal="rise" className="text-muted-foreground mb-12 max-w-2xl"><RichText value={tx(tl.subtitle)} /></p>

        <div className="flex flex-col gap-10">
          {tl.groups.map((group) => (
            <div key={group.id}>
              <h3 data-reveal="rise" className="font-mono text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: toolColor }}>
                <RichText value={tx(group.name)} />
              </h3>

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {group.tools.map((tool) => (
                  <div
                    key={tool.id}
                    data-reveal="pop"
                    className="group relative p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-300"
                  >
                    <div
                      className="h-14 w-14 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${toolColor} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${toolColor} 30%, transparent)`,
                      }}
                    >
                      <ToolGlyph icon={tool.icon} color={toolColor} />
                    </div>

                    <h4 className="font-sans font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      <RichText value={tx(tool.name)} />
                    </h4>
                    <p className="font-mono text-xs mb-3" style={{ color: toolColor }}>
                      <RichText value={tx(tool.category)} />
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-muted-foreground"><RichText value={tx(tl.mastery)} /></span>
                        <span className="font-mono text-xs text-muted-foreground">{tool.proficiency}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover:opacity-100 opacity-80"
                          style={{ width: `${tool.proficiency}%`, backgroundColor: toolColor }}
                        />
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ boxShadow: `0 0 30px -10px ${toolColor}` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
