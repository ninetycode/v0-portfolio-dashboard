"use client"

import { useRef, useState } from "react"
import { Download, ExternalLink, Maximize2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GamePlayerProps {
  title: string
  releaseType: string
  embedUrl: string | null
  externalUrl: string | null
  width: number
  height: number
  coverImage: string | null
}

export function GamePlayer({ title, releaseType, embedUrl, externalUrl, width, height, coverImage }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  if (releaseType !== "browser") {
    return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">{releaseType === "download" ? <Download className="h-8 w-8" /> : <ExternalLink className="h-8 w-8" />}</div>
      <div><h2 className="font-serif text-xl font-semibold">{releaseType === "download" ? "Juego descargable" : "Juego externo"}</h2><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{releaseType === "download" ? "Este juego no funciona directamente en el navegador. Descarga la versión jugable para tu dispositivo." : "Este juego se juega desde una página externa."}</p></div>
      {externalUrl && <Button asChild className="gap-2"><a href={externalUrl} target="_blank" rel="noopener noreferrer">{releaseType === "download" ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}{releaseType === "download" ? "Descargar juego" : "Visitar juego"}</a></Button>}
    </div>
  }

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
            src={embedUrl ?? ""}
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
