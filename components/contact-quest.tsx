"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Scroll, Briefcase, MessageSquare, Gamepad2, Github, Linkedin, Send, Youtube, Instagram, X } from "lucide-react"
import { useLang } from "@/lib/i18n"

// Order: Freelance (left), Feedback (middle), Interview (right)
// Order: Feedback (left), Freelance (middle), Interview (right)
const questFormTypes: Array<"hire" | "interview" | "feedback"> = ["feedback", "hire", "interview"]
const questIcons = [
  <Gamepad2 key="feedback" className="h-5 w-5" />,
  <Briefcase key="hire" className="h-5 w-5" />,
  <MessageSquare key="interview" className="h-5 w-5" />,
]

// Dark mode uses CSS vars (they're vivid enough). Light mode uses explicit
// high-contrast hex values since the CSS vars are too faint on white backgrounds.
const difficultyColorMap = {
  dark: {
    Normal:     "var(--primary)",
    Fácil:      "#4ade80", // green-400
    Easy:       "#4ade80",
    Legendario: "var(--chart-4)",
    Legendary:  "var(--chart-4)",
  },
  light: {
    Normal:     "#3d5a9e", // slate-blue — matches primary
    Fácil:      "#16a34a", // green-600 — high contrast green
    Easy:       "#16a34a",
    Legendario: "#b45309", // amber-700 — high contrast gold
    Legendary:  "#b45309",
  },
} as const

const socialLinks = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/mathias-andino/", icon: <Linkedin className="h-5 w-5" /> },
  { name: "GitHub", href: "https://github.com/ninetycode", icon: <Github className="h-5 w-5" /> },
  { name: "Itch.io", href: "https://ninetygames.itch.io/", icon: <Gamepad2 className="h-5 w-5" /> },
  { name: "Instagram", href: "https://www.instagram.com/mathiasandino.ar", icon: <Instagram className="h-5 w-5" /> },
  { name: "YouTube", href: "https://www.youtube.com/@Mattez", icon: <Youtube className="h-5 w-5" /> },
  { name: "X", href: "https://x.com/mathigamedev", icon: <X className="h-5 w-5" /> },
]

export function ContactQuest() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const { t } = useLang()
  const ct = t.contact
  const { resolvedTheme } = useTheme()
  const colorPalette = resolvedTheme === "dark" ? difficultyColorMap.dark : difficultyColorMap.light

  const getColor = (difficulty: string) =>
    (colorPalette as Record<string, string>)[difficulty] ?? colorPalette.Normal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSelectedIdx(null)
    setFormData({ name: "", email: "", message: "" })
  }

  const selectedQuest = selectedIdx !== null ? ct.quests[selectedIdx] : null
  const selectedFormType = selectedIdx !== null ? questFormTypes[selectedIdx] : null
  const selectedIcon = selectedIdx !== null ? questIcons[selectedIdx] : null

  const getMessageLabel = () => {
    if (selectedFormType === "hire") return ct.describeProject
    if (selectedFormType === "interview") return ct.describePosition
    return ct.linkGame
  }

  return (
    <section id="contact" className="py-20 px-4 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
            <Scroll className="h-5 w-5 text-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{ct.title}</h2>
        </div>
        <p className="text-muted-foreground mb-12 max-w-2xl">{ct.subtitle}</p>

        {/* Quest Board */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {ct.quests.map((quest, index) => {
            const color = getColor(quest.difficulty)
            const bgTint = resolvedTheme === "dark"
              ? `color-mix(in oklch, ${color} 18%, transparent)`
              : `color-mix(in srgb, ${color} 12%, white)`
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 flex flex-col"
              >
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-xs font-mono rounded-bl-lg font-semibold"
                  style={{ backgroundColor: bgTint, color }}
                >
                  {quest.difficulty}
                </div>

                <CardHeader className="pb-2">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: bgTint, color }}
                  >
                    {questIcons[index]}
                  </div>
                  <CardTitle className="font-serif text-lg">{quest.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{quest.description}</p>

                  <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-muted/50">
                    <span className="font-mono text-xs text-muted-foreground">{ct.reward}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color }}>{quest.reward}</span>
                  </div>

                  <Button
                    onClick={() => setSelectedIdx(index)}
                    className="w-full gap-2 mt-auto"
                    style={{ backgroundColor: color, color: "#ffffff" }}
                  >
                    {ct.accept}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Social Links */}
        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">{ct.findMe}</p>
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                {link.icon}
                <span className="font-sans text-sm">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <Dialog open={!!selectedQuest} onOpenChange={() => setSelectedIdx(null)}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-md border-border/50">
          {selectedQuest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${difficultyColorMap[selectedQuest.difficulty] ?? "var(--primary)"} 15%, transparent)`,
                      color: difficultyColorMap[selectedQuest.difficulty] ?? "var(--primary)",
                    }}
                  >
                    {selectedIcon}
                  </div>
                  <DialogTitle className="font-serif text-xl">{selectedQuest.title}</DialogTitle>
                </div>
                <DialogDescription>{ct.completeForm}</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="name" className="block font-mono text-sm text-muted-foreground mb-1">
                    {ct.name}
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={ct.namePlaceholder}
                    required
                    className="bg-card/50 border-border/50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-mono text-sm text-muted-foreground mb-1">
                    {ct.email}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={ct.emailPlaceholder}
                    required
                    className="bg-card/50 border-border/50"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-mono text-sm text-muted-foreground mb-1">
                    {getMessageLabel()}
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={ct.messagePlaceholder}
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
                    {ct.cancel}
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
                    {ct.send}
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
