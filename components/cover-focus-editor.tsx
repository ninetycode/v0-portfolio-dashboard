"use client"

import { useRef, useState } from "react"
import { ImageOff, Move, RotateCcw, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  DEFAULT_COVER_FOCUS,
  MAX_COVER_ZOOM,
  MIN_COVER_ZOOM,
  coverFocusStyle,
  isDefaultFocus,
  sanitizeCoverFocus,
  type CoverFocus,
} from "@/lib/cover-focus"
import { cn } from "@/lib/utils"

type Props = {
  image: string
  value: CoverFocus | null
  onChange: (value: CoverFocus | null) => void
}

const KEY_STEP = 2

const clampPercent = (n: number) => Math.min(100, Math.max(0, n))

export function CoverFocusEditor({ image, value, onChange }: Props) {
  const focus = value ?? DEFAULT_COVER_FOCUS
  const boxRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startY: number; focus: CoverFocus } | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [failedSrc, setFailedSrc] = useState<string | undefined>()

  const commit = (next: CoverFocus) => onChange(sanitizeCoverFocus(next))

  // Cuánto se puede mover la imagen (en px) en cada eje con el zoom actual.
  const travel = (zoom: number) => {
    const box = boxRef.current
    if (!box || !natural) return null
    const bw = box.clientWidth
    const bh = box.clientHeight
    const scale = Math.max(bw / natural.w, bh / natural.h) * zoom
    return { x: natural.w * scale - bw, y: natural.h * scale - bh }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: e.clientX, startY: e.clientY, focus }
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    const range = travel(focus.zoom)
    if (!start || !range) return
    const dx = e.clientX - start.startX
    const dy = e.clientY - start.startY
    commit({
      ...start.focus,
      x: range.x > 1 ? clampPercent(start.focus.x - (dx / range.x) * 100) : start.focus.x,
      y: range.y > 1 ? clampPercent(start.focus.y - (dy / range.y) * 100) : start.focus.y,
    })
  }

  const endDrag = () => {
    drag.current = null
    setDragging(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    commit({ ...focus, x: clampPercent(focus.x + move[0]), y: clampPercent(focus.y + move[1]) })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>Encuadre de la miniatura</Label>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {"Arrastra la imagen para elegir qué parte se ve en las tarjetas y ajusta el zoom."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          disabled={isDefaultFocus(value)}
          onClick={() => onChange(null)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer
        </Button>
      </div>

      <div
        ref={boxRef}
        role="group"
        tabIndex={0}
        aria-label="Vista previa de la miniatura. Usa las flechas del teclado para mover el encuadre."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className={cn(
          "relative aspect-video w-full max-w-xl touch-none select-none overflow-hidden rounded-md border border-border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {failedSrc === image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center text-xs text-muted-foreground">
            <ImageOff className="h-5 w-5" aria-hidden="true" />
            <span>No se pudo cargar la imagen. Súbela de nuevo (JPG, PNG o WebP).</span>
          </div>
        ) : (
          <>
            <img
              src={image || "/placeholder.svg"}
              alt=""
              draggable={false}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onError={() => setFailedSrc(image)}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ imageRendering: "pixelated", ...coverFocusStyle(focus) }}
            />
            <span className="pointer-events-none absolute top-2 left-2 flex items-center gap-1.5 rounded bg-background/90 px-2 py-1 font-mono text-[11px] text-foreground">
              <Move className="h-3 w-3" />
              Arrastrar
            </span>
          </>
        )}
      </div>

      <div className="flex max-w-xl items-center gap-3">
        <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Slider
          aria-label="Zoom de la miniatura"
          min={MIN_COVER_ZOOM}
          max={MAX_COVER_ZOOM}
          step={0.05}
          value={[focus.zoom]}
          onValueChange={([zoom]) => commit({ ...focus, zoom })}
        />
        <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">{focus.zoom.toFixed(2)}x</span>
      </div>
    </div>
  )
}
