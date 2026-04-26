"use client"

import { useState, useEffect } from "react"
import { Wrench, BookOpen, GitBranch, Table2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useLang } from "@/lib/i18n"

type ToolIcon =
  | { type: "brand"; slug: string }
  | { type: "lucide"; node: React.ReactNode }

interface Tool {
  id: string
  nameKey: string
  nameEn?: string
  category: string
  icon: ToolIcon
  proficiency: number
}

// Groups ordered by role affinity, tools within each group sorted by proficiency desc
const toolGroups: { groupKey: string; groupEn: string; tools: Tool[] }[] = [
  {
    groupKey: "Motores & Lenguajes",
    groupEn: "Engines & Languages",
    tools: [
      { id: "godot",    nameKey: "Godot",    category: "Motor",    icon: { type: "brand", slug: "godotengine" }, proficiency: 85 },
      { id: "gdscript", nameKey: "GDScript", category: "Lenguaje", icon: { type: "brand", slug: "godotengine" }, proficiency: 70 },
      { id: "unity",    nameKey: "Unity",    category: "Motor",    icon: { type: "brand", slug: "unity" },       proficiency: 25 },
      { id: "csharp",   nameKey: "C#",       category: "Lenguaje", icon: { type: "brand", slug: "dotnet" },      proficiency: 25 },
    ],
  },
  {
    groupKey: "Narrativa & Arte",
    groupEn: "Narrative & Art",
    tools: [
      { id: "twine",    nameKey: "Twine",    category: "Narrativa", icon: { type: "lucide", node: <BookOpen className="h-6 w-6" /> }, proficiency: 75 },
      { id: "aseprite", nameKey: "Aseprite", category: "2D",        icon: { type: "brand", slug: "aseprite" },                        proficiency: 70 },
      { id: "figma",    nameKey: "Figma",    category: "UI/UX",     icon: { type: "brand", slug: "figma" },                           proficiency: 40 },
    ],
  },
  {
    groupKey: "Gestión & Colaboración",
    groupEn: "Management & Collaboration",
    tools: [
      { id: "miro",   nameKey: "Miro",   category: "Gestión", icon: { type: "brand", slug: "miro" },   proficiency: 65 },
      { id: "jira",   nameKey: "Jira",   category: "Gestión", icon: { type: "brand", slug: "jira" },   proficiency: 60 },
      { id: "notion", nameKey: "Notion", category: "Gestión", icon: { type: "brand", slug: "notion" }, proficiency: 50 },
    ],
  },
  {
    groupKey: "Datos & Versionado",
    groupEn: "Data & Version Control",
    tools: [
      { id: "sheets", nameKey: "Google Sheets / Excel", nameEn: "Google Sheets / Excel", category: "Datos",      icon: { type: "lucide", node: <Table2 className="h-6 w-6" /> },    proficiency: 60 },
      { id: "git",    nameKey: "Git",                   category: "Versionado",           icon: { type: "brand", slug: "git" },                                                      proficiency: 60 },
    ],
  },
]

function ToolIcon({ icon, color }: { icon: ToolIcon; color: string }) {
  if (icon.type === "lucide") {
    return <span style={{ color }}>{icon.node}</span>
  }
  // Use white for dark-mode brand logos, colorHex for light-mode
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
  const { t, lang } = useLang()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const tl = t.tools

  // Wait for mount to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dark mode: site's mint green. Light mode: Godot-style blue.
  // Default to a neutral color until mounted to avoid flash
  const toolColor = !mounted ? "#86efac" : resolvedTheme === "dark" ? "#86efac" : "#478cbf"

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
            <Wrench className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{tl.title}</h2>
        </div>
        <p className="text-muted-foreground mb-12 max-w-2xl">{tl.subtitle}</p>

        <div className="flex flex-col gap-10">
          {toolGroups.map((group) => (
            <div key={group.groupKey}>
              {/* Group header */}
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: toolColor }}>
                {lang === "en" ? group.groupEn : group.groupKey}
              </h3>

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {group.tools.map((tool) => {
                  const displayName = lang === "en" && tool.nameEn ? tool.nameEn : tool.nameKey
                  const displayCategory = tl.categories[tool.category as keyof typeof tl.categories] ?? tool.category
                  return (
                    <div
                      key={tool.id}
                      className="group relative p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
                    >
                      {/* Icon */}
                      <div
                        className="h-14 w-14 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${toolColor} 15%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${toolColor} 30%, transparent)`,
                        }}
                      >
                        <ToolIcon icon={tool.icon} color={toolColor} />
                      </div>

                      <h4 className="font-sans font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {displayName}
                      </h4>
                      <p className="font-mono text-xs mb-3" style={{ color: toolColor }}>
                        {displayCategory}
                      </p>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-muted-foreground">{tl.mastery}</span>
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
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
