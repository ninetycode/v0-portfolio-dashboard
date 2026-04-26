"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, ExternalLink, Gamepad2 } from "lucide-react"
import { useLang } from "@/lib/i18n"

const gameImages = ["/game-1.jpg", "/game-2.jpg", "/game-3.jpg", "/game-4.jpg"]

const typeConfig: Record<string, { label: string; labelEn: string; color: string }> = {
  complete:  { label: "Juego Completo", labelEn: "Complete Game",   color: "bg-primary text-primary-foreground" },
  jam:       { label: "Game Jam",       labelEn: "Game Jam",        color: "bg-purple-500 text-white" },
  wip:       { label: "En Desarrollo",  labelEn: "In Development",  color: "bg-amber-500 text-black" },
}

type FilterKey = "all" | "complete" | "jam" | "wip"

export function FeaturedGames() {
  const { t, lang } = useLang()
  const f = t.featured
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all",      label: f.filterAll      },
    { key: "complete", label: f.filterComplete  },
    { key: "jam",      label: f.filterJam       },
    { key: "wip",      label: f.filterWip       },
  ]

  const visibleGames = f.games.filter(
    (g) => activeFilter === "all" || g.type === activeFilter
  )

  return (
    <section id="featured" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-3">
            PORTFOLIO
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            {f.title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {lang === "es"
              ? "Una selección de mis trabajos más recientes en desarrollo y diseño de videojuegos."
              : "A selection of my most recent work in game development and design."}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-5 py-2 rounded-full text-sm font-mono font-medium border transition-all duration-200 ${
                activeFilter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground border-border hover:border-primary/60 hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards Grid — 2 columns, large */}
        <div className="grid gap-6 md:grid-cols-2">
          {visibleGames.map((game, index) => {
            const cfg = typeConfig[game.type] ?? typeConfig.complete
            const typeLabel = lang === "es" ? cfg.label : cfg.labelEn
            const imgSrc = gameImages[f.games.indexOf(game)] ?? gameImages[0]

            return (
              <div
                key={game.title}
                className="group relative rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-primary/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={imgSrc}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />

                  {/* Status badge top-right */}
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold z-10 ${cfg.color}`}>
                    {typeLabel}
                  </span>

                  {/* Play button — visible on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <a
                      href={game.itchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-all duration-200 shadow-xl"
                      aria-label={`Jugar ${game.title} en itch.io`}
                    >
                      <PlayCircle className="h-8 w-8" />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <Link
                    href={`/games?game=${game.gameIndex}`}
                    className="font-serif text-xl font-bold mb-2 hover:text-primary transition-colors inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {game.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {game.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {game.genre.map((g) => (
                      <Badge
                        key={g}
                        variant="outline"
                        className="font-mono text-xs border-border/60 text-muted-foreground"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA button */}
        <div className="mt-12 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/60 bg-transparent text-foreground font-mono text-sm hover:border-primary hover:text-primary transition-all duration-200"
          >
            {f.seeAll}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
