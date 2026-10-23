"use client"

import { useRef, useState } from "react"
import { Maximize2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GamePlayerProps {
  title: string
  embedUrl: string
  width: number
  height: number
  coverImage: string | null
}

export function GamePlayer({ title, embedUrl, width, height, coverImage }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  const goFullscreen = () => {
    containerRef.current?.requestFullscreen?.()
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-muted"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {started ? (
          <iframe
            src={embedUrl}
            title={`Jugar ${title}`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Cargar y jugar ${title}`}
          >
            {coverImage && (
              <img
                src={coverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <span className="relative flex flex-col items-center gap-3">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-9 w-9 translate-x-0.5 fill-current" />
              </span>
              <span className="rounded-md bg-background/85 px-3 py-1 font-mono text-sm text-foreground backdrop-blur-sm">
                {"Click para jugar en el navegador"}
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">
          {"Haz click dentro del juego para capturar el teclado."}
        </p>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={goFullscreen} disabled={!started}>
          <Maximize2 className="h-4 w-4" />
          Pantalla completa
        </Button>
      </div>
    </div>
  )
}
