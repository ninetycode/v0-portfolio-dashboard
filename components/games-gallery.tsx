"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Gamepad2, Monitor, Smartphone, ExternalLink, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useLang } from "@/lib/i18n"

const gamesPlatforms = [
  ["PC", "Web"],
  ["PC"],
  ["PC", "Mobile"],
  ["PC", "Web"],
  ["PC"],
  ["PC", "Mobile"],
]

const gamesImages = [
  "/game-1.jpg", "/game-2.jpg", "/game-3.jpg",
  "/game-4.jpg", "/game-5.jpg", "/game-6.jpg",
]

const gamesScreenshots = [
  ["/game-1-ss1.jpg", "/game-1-ss2.jpg", "/game-1-ss3.jpg"],
  ["/game-2-ss1.jpg", "/game-2-ss2.jpg", "/game-2-ss3.jpg"],
  ["/game-3-ss1.jpg", "/game-3-ss2.jpg", "/game-3-ss3.jpg"],
  ["/game-4-ss1.jpg", "/game-4-ss2.jpg", "/game-4-ss3.jpg"],
  ["/game-5-ss1.jpg", "/game-5-ss2.jpg", "/game-5-ss3.jpg"],
  ["/game-6-ss1.jpg", "/game-6-ss2.jpg", "/game-6-ss3.jpg"],
]

const gamesLinks = [
  { gddLink: "#", playLink: "#" },
  { gddLink: "#", playLink: "#" },
  { gddLink: "#", playLink: "#" },
  { gddLink: undefined, playLink: "#" },
  { gddLink: "#", playLink: undefined },
  { gddLink: undefined, playLink: "#" },
]

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "PC":
    case "Web":
      return <Monitor className="h-3 w-3" />
    case "Mobile":
      return <Smartphone className="h-3 w-3" />
    default:
      return <Gamepad2 className="h-3 w-3" />
  }
}

export function GamesGallery() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const { t } = useLang()
  const gm = t.games
  const searchParams = useSearchParams()

  // Auto-open dialog when ?game=N is in the URL
  useEffect(() => {
    const gameParam = searchParams.get("game")
    if (gameParam !== null) {
      const idx = parseInt(gameParam, 10)
      if (!isNaN(idx) && idx >= 0 && idx < gm.items.length) {
        setSelectedIdx(idx)
        setCurrentScreenshot(0)
      }
    }
  }, [searchParams, gm.items.length])

  const screenshots = selectedIdx !== null ? gamesScreenshots[selectedIdx] : []

  const nextScreenshot = () => setCurrentScreenshot((prev) => (prev + 1) % screenshots.length)
  const prevScreenshot = () => setCurrentScreenshot((prev) => (prev - 1 + screenshots.length) % screenshots.length)

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/30">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{gm.title}</h2>
        </div>
        <p className="text-muted-foreground mb-12 max-w-2xl">{gm.subtitle}</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gm.items.map((game, index) => (
            <Card
              key={index}
              onClick={() => { setSelectedIdx(index); setCurrentScreenshot(0) }}
              className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image src={gamesImages[index]} alt={game.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-1">
                  {gamesPlatforms[index].map((platform) => (
                    <div key={platform} className="flex h-6 w-6 items-center justify-center rounded bg-background/80 backdrop-blur-sm border border-border/50" title={platform}>
                      <PlatformIcon platform={platform} />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-mono text-sm text-primary">{gm.seeDetails}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{game.description}</p>
                <div className="flex flex-wrap gap-1">
                  {game.genre.map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">{g}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={selectedIdx !== null} onOpenChange={() => setSelectedIdx(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border/50">
          {selectedIdx !== null && (() => {
            const game = gm.items[selectedIdx]
            const links = gamesLinks[selectedIdx]
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl mb-2">{game.title}</DialogTitle>
                  <DialogDescription className="sr-only">Details of {game.title}</DialogDescription>
                  <div className="flex flex-wrap gap-2">
                    {game.genre.map((g) => <Badge key={g} variant="secondary" className="font-mono text-xs bg-primary/10 text-primary">{g}</Badge>)}
                    {gamesPlatforms[selectedIdx].map((p) => <Badge key={p} variant="outline" className="font-mono text-xs">{p}</Badge>)}
                  </div>
                </DialogHeader>

                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mt-4">
                  <Image src={screenshots[currentScreenshot]} alt={`${game.title} screenshot ${currentScreenshot + 1}`} fill className="object-cover" />
                  {screenshots.length > 1 && (
                    <>
                      <button onClick={prevScreenshot} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors" aria-label="Previous">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={nextScreenshot} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors" aria-label="Next">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {screenshots.map((_, i) => (
                          <button key={i} onClick={() => setCurrentScreenshot(i)} className={`h-2 w-2 rounded-full transition-colors ${i === currentScreenshot ? "bg-primary" : "bg-foreground/30"}`} aria-label={`Screenshot ${i + 1}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <p className="text-muted-foreground mt-4">{game.description}</p>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <h4 className="font-serif text-lg font-semibold mb-2 text-primary">{gm.role}</h4>
                  <p className="text-sm text-muted-foreground">{game.role}</p>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <h4 className="font-serif text-lg font-semibold mb-2 text-accent">{gm.challenge}</h4>
                  <p className="text-sm text-muted-foreground">{game.challenge}</p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {links.gddLink && (
                    <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary" asChild>
                      <a href={links.gddLink} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />{gm.viewGDD}
                      </a>
                    </Button>
                  )}
                  {links.playLink && (
                    <Button className="gap-2" asChild>
                      <a href={links.playLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />{gm.playDemo}
                      </a>
                    </Button>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </section>
  )
}
