"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

function StarGlyph({ fill, className }: { fill: 0 | 0.5 | 1; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <Star className="h-full w-full text-muted-foreground/40" strokeWidth={1.5} />
      {fill > 0 && (
        <Star
          className="absolute inset-0 h-full w-full fill-rating text-rating"
          strokeWidth={1.5}
          style={fill === 0.5 ? { clipPath: "inset(0 50% 0 0)" } : undefined}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

function fillFor(index: number, value: number): 0 | 0.5 | 1 {
  if (value >= index + 1) return 1
  if (value >= index + 0.5) return 0.5
  return 0
}

export function StarDisplay({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} de 5 estrellas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarGlyph key={i} fill={fillFor(i, value)} className={size} />
      ))}
    </span>
  )
}

export function StarInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value

  return (
    <div className="flex items-center gap-3">
      <div
        className="inline-flex items-center gap-1"
        role="radiogroup"
        aria-label="Puntuación"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="relative h-8 w-8">
            <StarGlyph fill={fillFor(i, shown)} className="h-8 w-8" />
            {[0.5, 1].map((part) => {
              const starValue = i + part
              const disabled = starValue < 1
              return (
                <button
                  key={part}
                  type="button"
                  role="radio"
                  aria-checked={value === starValue}
                  aria-label={`${starValue} estrellas`}
                  disabled={disabled}
                  onMouseEnter={() => !disabled && setHover(starValue)}
                  onFocus={() => !disabled && setHover(starValue)}
                  onBlur={() => setHover(null)}
                  onClick={() => onChange(starValue)}
                  className={cn(
                    "absolute top-0 h-full w-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                    part === 0.5 ? "left-0" : "right-0",
                    disabled ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                />
              )
            })}
          </span>
        ))}
      </div>
      <span className="font-mono text-sm text-muted-foreground tabular-nums min-w-10">
        {shown > 0 ? shown.toFixed(1) : "-"}
      </span>
    </div>
  )
}

export function RatingBadge({ avg, count }: { avg: number | null; count: number }) {
  const hasRating = avg !== null && count > 0
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md bg-background/85 backdrop-blur-sm border border-border/60 px-2 py-1 font-mono text-xs"
      aria-label={hasRating ? `Puntuación media ${avg} de 5, ${count} valoraciones` : "Sin puntuaciones todavía"}
    >
      <Star
        className={cn("h-3.5 w-3.5", hasRating ? "fill-rating text-rating" : "fill-muted-foreground/30 text-muted-foreground/50")}
        strokeWidth={1.5}
      />
      {hasRating && <span className="text-foreground tabular-nums">{avg!.toFixed(1)}</span>}
    </span>
  )
}
