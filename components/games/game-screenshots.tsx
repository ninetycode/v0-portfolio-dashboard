"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

export function GameScreenshots({ title, screenshots }: { title: string; screenshots: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (screenshots.length === 0) return null

  const step = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + screenshots.length) % screenshots.length))

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {screenshots.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group block w-full overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Ampliar captura ${i + 1}`}
            >
              <img
                src={src || "/placeholder.svg"}
                alt={`Captura ${i + 1} de ${title}`}
                className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ imageRendering: "pixelated" }}
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-5xl border-border bg-background/95 p-2 backdrop-blur-md">
          <DialogTitle className="sr-only">{`Captura de ${title}`}</DialogTitle>
          <DialogDescription className="sr-only">{"Usa las flechas para navegar entre capturas."}</DialogDescription>
          {openIndex !== null && (
            <div className="relative">
              <img
                src={screenshots[openIndex] || "/placeholder.svg"}
                alt={`Captura ${openIndex + 1} de ${title}`}
                className="w-full rounded-md"
                style={{ imageRendering: "pixelated" }}
              />
              {screenshots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    aria-label="Captura anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    aria-label="Captura siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
