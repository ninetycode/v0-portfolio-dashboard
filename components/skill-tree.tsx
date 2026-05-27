"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Code, Layers, Users, Cpu } from "lucide-react"
import { useLang } from "@/lib/i18n"

const skillColors: Record<string, string> = {
  foundation: "var(--akane-mint)",
  programming: "var(--primary)",
  "level-design": "var(--accent)",
  production: "var(--akane-mint-dim)",
}

const skillLevels: Record<string, { level: number; maxLevel: number }> = {
  foundation: { level: 5, maxLevel: 5 },
  programming: { level: 4, maxLevel: 5 },
  "level-design": { level: 4, maxLevel: 5 },
  production: { level: 3, maxLevel: 5 },
}

const skillIcons: Record<string, React.ReactNode> = {
  foundation: <Cpu className="h-5 w-5" />,
  programming: <Code className="h-5 w-5" />,
  "level-design": <Layers className="h-5 w-5" />,
  production: <Users className="h-5 w-5" />,
}

export function SkillTree() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const { t } = useLang()
  const sk = t.skills

  const activeSkill = selectedSkill || hoveredSkill

  const skillIds = ["foundation", "programming", "level-design", "production"] as const
  type SkillId = typeof skillIds[number]

  const buildSkill = (id: SkillId) => ({
    id,
    name: sk.nodes[id].name,
    icon: skillIcons[id],
    level: skillLevels[id].level,
    maxLevel: skillLevels[id].maxLevel,
    certifications: sk.nodes[id].certifications,
    color: skillColors[id],
  })

  return (
    <section id="skills" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/30">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{sk.title}</h2>
        </div>
        <p className="text-muted-foreground mb-12 max-w-2xl">{sk.subtitle}</p>

        <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
          {/* Skill Tree Visual */}
          <div className="relative flex flex-col items-center py-8">
            <SkillNode
              skill={buildSkill("foundation")}
              isActive={activeSkill === "foundation"}
              isSelected={selectedSkill === "foundation"}
              onHover={() => setHoveredSkill("foundation")}
              onLeave={() => setHoveredSkill(null)}
              onClick={() => setSelectedSkill(selectedSkill === "foundation" ? null : "foundation")}
            />

            <div className="relative w-full h-16">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <line x1="50%" y1="0" x2="16.66%" y2="100%" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="0" x2="83.33%" y2="100%" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>

            <div className="flex justify-between w-full max-w-md">
              {(["programming", "level-design", "production"] as const).map((id) => (
                <SkillNode
                  key={id}
                  skill={buildSkill(id)}
                  isActive={activeSkill === id}
                  isSelected={selectedSkill === id}
                  onHover={() => setHoveredSkill(id)}
                  onLeave={() => setHoveredSkill(null)}
                  onClick={() => setSelectedSkill(selectedSkill === id ? null : id)}
                />
              ))}
            </div>
          </div>

          {/* Skill Details Panel */}
          <div>
            {activeSkill ? (() => {
              const s = buildSkill(activeSkill as SkillId)
              return (
                <Card className="border-border/50 bg-card overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: s.color }} />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `color-mix(in oklch, ${s.color} 20%, transparent)`, color: s.color }}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold">{s.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-muted-foreground">{sk.level}</span>
                          <div className="flex gap-1">
                            {Array.from({ length: s.maxLevel }).map((_, i) => (
                              <div
                                key={i}
                                className="h-2 w-4 rounded-sm transition-colors"
                                style={{ backgroundColor: i < s.level ? s.color : "var(--muted)" }}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-xs" style={{ color: s.color }}>
                            {s.level}/{s.maxLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-mono text-sm text-muted-foreground">{sk.certs}</h4>
                      <ul className="space-y-2">
                        {s.certifications.map((cert, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })() : (
              <Card className="border-dashed border-border/50 bg-muted/30">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[250px]">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">{sk.hoverPrompt}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

interface SkillData {
  id: string
  name: string
  icon: React.ReactNode
  level: number
  maxLevel: number
  certifications: string[]
  color: string
}

interface SkillNodeProps {
  skill: SkillData
  isActive: boolean
  isSelected: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}

function SkillNode({ skill, isActive, isSelected, onHover, onLeave, onClick }: SkillNodeProps) {
  return (
    <button
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
        isActive || isSelected
          ? "scale-110"
          : "hover:scale-105"
      }`}
      style={{
        borderColor: isActive || isSelected ? skill.color : "var(--border)",
        backgroundColor: isActive || isSelected 
          ? `color-mix(in oklch, ${skill.color} 10%, transparent)` 
          : "var(--card)",
        boxShadow: isActive || isSelected 
          ? `0 0 20px -5px ${skill.color}` 
          : "none"
      }}
    >
      <div 
        className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors"
        style={{ 
          backgroundColor: `color-mix(in oklch, ${skill.color} 20%, transparent)`,
          color: skill.color 
        }}
      >
        {skill.icon}
      </div>
      <span className="font-mono text-xs text-center max-w-[80px] leading-tight">
        {skill.name}
      </span>
      
      {/* Level indicator */}
      <div className="flex gap-0.5">
        {Array.from({ length: skill.maxLevel }).map((_, i) => (
          <div
            key={i}
            className="h-1 w-2 rounded-full transition-colors"
            style={{
              backgroundColor: i < skill.level ? skill.color : "var(--muted)"
            }}
          />
        ))}
      </div>
    </button>
  )
}
