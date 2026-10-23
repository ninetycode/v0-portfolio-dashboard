import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Keyboard } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StatusBar } from "@/components/status-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GamePlayer } from "@/components/games/game-player"
import { GameScreenshots } from "@/components/games/game-screenshots"
import { GameDocLinks } from "@/components/games/game-doc-links"
import { GameReviews } from "@/components/games/game-reviews"
import { RatingBadge } from "@/components/games/star-rating"
import { getGameBySlug } from "@/app/actions/games"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  if (!game) return { title: "Juego no encontrado" }
  return {
    title: `${game.title} | Mathías Andino`,
    description: game.shortDescription,
    openGraph: game.coverImage ? { images: [game.coverImage] } : undefined,
  }
}

function parseControls(controls: string) {
  return controls
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [keys, ...rest] = line.split(" - ")
      return { keys: keys.trim(), action: rest.join(" - ").trim() }
    })
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl font-semibold text-balance">{children}</h2>
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  if (!game) notFound()

  const controls = parseControls(game.controls)
  const details = [
    { label: "Género", value: game.genres.join(", ") },
    { label: "Plataforma", value: game.platforms.join(", ") },
    { label: "Motor", value: game.engine },
    { label: "Estado", value: game.status },
  ].filter((d) => d.value)

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-24 pb-20">
        <header className="flex flex-col gap-5">
          <Link
            href="/games"
            className="flex items-center gap-2 self-start font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mis videojuegos
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <h1 className="font-serif text-4xl font-bold text-balance md:text-5xl">{game.title}</h1>
              <p className="max-w-2xl leading-relaxed text-muted-foreground text-pretty">{game.shortDescription}</p>
              <div className="flex flex-wrap items-center gap-2">
                {game.genres.map((g) => (
                  <Badge key={g} variant="secondary" className="border-primary/20 bg-primary/10 font-mono text-xs text-primary">
                    {g}
                  </Badge>
                ))}
                <RatingBadge avg={game.avgRating} count={game.reviewCount} />
                <span className="font-mono text-xs text-muted-foreground">
                  {game.reviewCount === 1 ? "1 valoración" : `${game.reviewCount} valoraciones`}
                </span>
              </div>
            </div>
            {game.externalUrl && (
              <Button asChild variant="outline" className="gap-2 bg-transparent">
                <a href={game.externalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Ver en itch.io
                </a>
              </Button>
            )}
          </div>
        </header>

        {game.embedUrl && (
          <section aria-label="Jugar">
            <GamePlayer
              title={game.title}
              embedUrl={game.embedUrl}
              width={game.embedWidth}
              height={game.embedHeight}
              coverImage={game.coverImage}
            />
          </section>
        )}

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-4">
              <SectionHeading>Descripción</SectionHeading>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{game.description}</p>
            </section>

            {controls.length > 0 && (
              <section className="flex flex-col gap-4">
                <SectionHeading>Controles</SectionHeading>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {controls.map((c) => (
                    <div
                      key={c.keys}
                      className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3"
                    >
                      <dt className="flex flex-wrap gap-1">
                        {c.keys.split("/").map((k) => (
                          <kbd
                            key={k}
                            className="min-w-8 rounded border border-border border-b-2 bg-muted px-2 py-0.5 text-center font-mono text-xs text-foreground"
                          >
                            {k.trim()}
                          </kbd>
                        ))}
                      </dt>
                      <dd className="text-right text-sm text-muted-foreground">{c.action}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {game.screenshots.length > 0 && (
              <section className="flex flex-col gap-4">
                <SectionHeading>Capturas</SectionHeading>
                <GameScreenshots title={game.title} screenshots={game.screenshots} />
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-8">
            <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
                <Keyboard className="h-4 w-4 text-primary" />
                Ficha técnica
              </h2>
              <dl className="flex flex-col gap-3">
                {details.map((d) => (
                  <div key={d.label} className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{d.label}</dt>
                    <dd className="text-right text-sm text-foreground">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-serif text-lg font-semibold">Documentación</h2>
              <GameDocLinks links={game.docLinks} />
            </section>
          </aside>
        </div>

        <section className="flex flex-col gap-6 border-t border-border pt-12">
          <SectionHeading>Puntuaciones y feedback</SectionHeading>
          <GameReviews gameId={game.id} reviews={game.reviews} avgRating={game.avgRating} />
        </section>
      </main>

      <div className="mb-12">
        <Footer />
      </div>
      <StatusBar />
    </div>
  )
}
