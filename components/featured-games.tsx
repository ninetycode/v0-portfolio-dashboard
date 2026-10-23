"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Gamepad2, PlayCircle } from "lucide-react"
import { RatingBadge } from "@/components/games/star-rating"
import { useLang } from "@/lib/i18n"
import type { GameSummary } from "@/lib/games-types"

export function FeaturedGames({ games }: { games: GameSummary[] }) {
  const { t, lang } = useLang()
  const f = t.featured

  return (
    <section id="featured" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-3">PORTFOLIO</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">{f.title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {lang === "es"
              ? "Una selección de mis trabajos más recientes en desarrollo y diseño de videojuegos."
              : "A selection of my most recent work in game development and design."}
          </p>
        </div>

        {games.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground">
            {lang === "es" ? "Próximamente." : "Coming soon."}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {games.slice(0, 4).map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-primary/50 transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={`Portada de ${game.title}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-all duration-300" />
                  <div className="absolute top-4 right-4 z-10">
                    <RatingBadge avg={game.avgRating} count={game.reviewCount} />
                  </div>
                  <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
                      <PlayCircle className="h-8 w-8" />
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {game.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((g) => (
                      <Badge key={g} variant="outline" className="font-mono text-xs border-border/60 text-muted-foreground">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

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
