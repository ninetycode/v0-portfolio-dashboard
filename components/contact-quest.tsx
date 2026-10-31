"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Scroll, Briefcase, Mail, MessageSquare, Gamepad2, Github, Linkedin, Send, Youtube, Instagram, X, Bug } from "lucide-react"
import { useSiteLang } from "@/lib/site-content/context"
import { SectionEditLink } from "@/components/section-edit-link"
import { RichText } from "@/components/rich-text"
import { plainText } from "@/lib/site-content/rich-text"
import type { Difficulty, QuestKind, SocialIcon } from "@/lib/site-content/types"

const difficultyColorMap: Record<"dark" | "light", Record<Difficulty, string>> = {
  dark: {
    easy: "#4ade80",
    normal: "var(--primary)",
    legendary: "var(--chart-4)",
  },
  light: {
    easy: "#16a34a",
    normal: "#3d5a9e",
    legendary: "#b45309",
  },
}

const questIcons: Record<QuestKind, ReactNode> = {
  feedback: <Gamepad2 className="h-5 w-5" />,
  hire: <Briefcase className="h-5 w-5" />,
  playtest: <Bug className="h-5 w-5" />,
  interview: <MessageSquare className="h-5 w-5" />,
}

const socialIcons: Record<SocialIcon, ReactNode> = {
  linkedin: <Linkedin className="h-5 w-5" />,
  itch: <Gamepad2 className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  x: <X className="h-5 w-5" />,
}

export function ContactQuest() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [mounted, setMounted] = useState(false)
  const { tx, content } = useSiteLang()
  const ct = content.missions
  const { resolvedTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  const colorPalette = mounted && resolvedTheme === "light" ? difficultyColorMap.light : difficultyColorMap.dark
  const getColor = (difficulty: Difficulty) => colorPalette[difficulty]

  const difficultyLabel = (difficulty: Difficulty) => {
    if (difficulty === "easy") return tx(ct.difficultyEasy)
    if (difficulty === "legendary") return tx(ct.difficultyLegendary)
    return tx(ct.difficultyNormal)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSelectedIdx(null)
    setFormData({ name: "", email: "", message: "" })
  }

  const selectedQuest = selectedIdx !== null ? ct.quests[selectedIdx] : null

  const messageLabel = () => {
    if (!selectedQuest) return tx(ct.linkGame)
    if (selectedQuest.kind === "hire") return tx(ct.describeProject)
    if (selectedQuest.kind === "interview") return tx(ct.describePosition)
    return tx(ct.linkGame)
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div data-reveal="rise" className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
            <Scroll className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold"><RichText value={tx(ct.title)} /></h2>
          <SectionEditLink seccion="misiones" />
        </div>
        <p data-reveal="rise" className="text-muted-foreground mb-12 max-w-2xl"><RichText value={tx(ct.subtitle)} /></p>

        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          {ct.quests.map((quest, index) => {
            const color = getColor(quest.difficulty)
            const bgTint = (mounted && resolvedTheme === "dark") || !mounted
              ? `color-mix(in oklch, ${color} 18%, transparent)`
              : `color-mix(in srgb, ${color} 12%, white)`
            return (
              <Card
                key={quest.id}
                data-reveal="pop"
                className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 flex flex-col"
              >
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-xs font-mono rounded-bl-lg font-semibold"
                  style={{ backgroundColor: bgTint, color }}
                >
                  <RichText value={difficultyLabel(quest.difficulty)} />
                </div>

                <CardHeader className="pb-2">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: bgTint, color }}
                  >
                    {questIcons[quest.kind]}
                  </div>
                  <CardTitle className="font-serif text-lg"><RichText value={tx(quest.title)} /></CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap"><RichText value={tx(quest.description)} /></p>

                  <div className="flex items-start gap-2 mb-3 p-2 rounded-md bg-muted/40">
                    <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5"><RichText value={tx(ct.requirementsLabel)} /></span>
                    <span className="font-mono text-xs text-foreground/80"><RichText value={tx(quest.requirements)} /></span>
                  </div>

                  <div className="flex items-start gap-2 mb-4 p-2 rounded-md bg-muted/50">
                    <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5"><RichText value={tx(ct.rewardLabel)} /></span>
                    <span className="font-mono text-xs font-semibold" style={{ color }}><RichText value={tx(quest.reward)} /></span>
                  </div>

                  <Button
                    onClick={() => setSelectedIdx(index)}
                    className="w-full gap-2 mt-auto"
                    style={{ backgroundColor: color, color: "#ffffff" }}
                  >
                    <RichText value={tx(ct.accept)} />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4"><RichText value={tx(ct.findMe)} /></p>
          <div className="flex items-center justify-center gap-4">
            {ct.socials.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal="rise"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                {socialIcons[link.icon]}
                <span className="font-sans text-sm"><RichText value={link.name} /></span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedQuest} onOpenChange={() => setSelectedIdx(null)}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-md border-border/50">
          {selectedQuest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${getColor(selectedQuest.difficulty)} 15%, transparent)`,
                      color: getColor(selectedQuest.difficulty),
                    }}
                  >
                    {questIcons[selectedQuest.kind]}
                  </div>
                  <DialogTitle className="font-serif text-xl"><RichText value={tx(selectedQuest.title)} /></DialogTitle>
                </div>
                <DialogDescription><RichText value={tx(ct.completeForm)} /></DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="name" className="block font-mono text-sm text-muted-foreground mb-1">
                    <RichText value={tx(ct.nameLabel)} />
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={plainText(tx(ct.namePlaceholder))}
                    required
                    className="bg-card/50 border-border/50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-mono text-sm text-muted-foreground mb-1">
                    <RichText value={tx(ct.emailLabel)} />
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={plainText(tx(ct.emailPlaceholder))}
                    required
                    className="bg-card/50 border-border/50"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-mono text-sm text-muted-foreground mb-1">
                    <RichText value={messageLabel()} />
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={plainText(tx(ct.messagePlaceholder))}
                    required
                    rows={4}
                    className="bg-card/50 border-border/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedIdx(null)}
                    className="flex-1 border-border/50"
                  >
                    <RichText value={tx(ct.cancel)} />
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    style={{
                      backgroundColor: getColor(selectedQuest.difficulty),
                      color: "#ffffff",
                    }}
                  >
                    <Send className="h-4 w-4" />
                    <RichText value={tx(ct.send)} />
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
