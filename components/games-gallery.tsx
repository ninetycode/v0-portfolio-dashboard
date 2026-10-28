"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Gamepad2, GripVertical, Loader2, Monitor, Play, Plus, Shield, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RatingBadge } from "@/components/games/star-rating"
import { useAdmin } from "@/lib/admin-context"
import { useLang } from "@/lib/i18n"
import { deleteGame, reorderGames } from "@/app/actions/games"
import type { GameSummary } from "@/lib/games-types"
import { cn } from "@/lib/utils"

export function GamesGallery({ games }: { games: GameSummary[] }) {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const { t } = useLang()
  const gm = t.games
  const [items, setItems] = useState(games)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<GameSummary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setItems(games), [games])

  const moveItem = (fromId: string, toId: string) => {
    if (fromId === toId) return
    setItems((prev) => {
      const next = [...prev]
      const from = next.findIndex((g) => g.id === fromId)
      const to = next.findIndex((g) => g.id === toId)
      if (from < 0 || to < 0) return prev
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const persistOrder = async () => {
    setDraggingId(null)
    const ids = items.map((g) => g.id)
    if (ids.join() === games.map((g) => g.id).join()) return
    setSavingOrder(true)
    const result = await reorderGames(ids)
    setSavingOrder(false)
    if (!result.success) setError(result.error)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!gameToDelete) return
    setIsDeleting(true)
    setError(null)
    const result = await deleteGame(gameToDelete.id)
    setIsDeleting(false)
    if (result.success) {
      setItems((prev) => prev.filter((g) => g.id !== gameToDelete.id))
      setGameToDelete(null)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/30">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-balance">{gm.title}</h1>
        </div>
        <p className="text-muted-foreground mb-10 max-w-2xl leading-relaxed">{gm.subtitle}</p>

        {isAdmin && (
          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-xs text-primary">
              <Shield className="h-4 w-4" />
              modo_admin
            </span>
            <Button asChild size="sm" className="ml-auto gap-2">
              <Link href="/games/editor"><Plus className="h-4 w-4" />Agregar juego</Link>
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              {"Arrastra las cartas para reordenarlas"}
            </span>
            {savingOrder && (
              <span className="ml-auto flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando orden...
              </span>
            )}
          </div>
        )}

        {error && <p className="mb-6 font-mono text-sm text-destructive">{error}</p>}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="font-mono text-sm text-muted-foreground">{"Todavía no hay juegos publicados."}</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((game) => (
              <li
                key={game.id}
                draggable={isAdmin}
                onDragStart={(e) => {
                  setDraggingId(game.id)
                  e.dataTransfer.effectAllowed = "move"
                }}
                onDragOver={(e) => {
                  if (!isAdmin || !draggingId) return
                  e.preventDefault()
                  moveItem(draggingId, game.id)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  persistOrder()
                }}
                onDragEnd={() => draggingId && persistOrder()}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:border-primary/50",
                  isAdmin && "cursor-grab active:cursor-grabbing",
                  draggingId === game.id && "opacity-40 ring-2 ring-primary",
                )}
              >
                {isAdmin && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/90 backdrop-blur-sm text-muted-foreground"
                      aria-hidden="true"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 border border-border bg-card/90 backdrop-blur-sm hover:border-destructive/50 hover:text-destructive"
                      onClick={() => setGameToDelete(game)}
                      aria-label={`Eliminar juego: ${game.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Link href={`/games/${game.slug}`} className="block" draggable={false}>
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {game.coverImage ? (
                      <img
                        src={game.coverImage}
                        alt={`Portada de ${game.title}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <RatingBadge avg={game.avgRating} count={game.reviewCount} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-mono text-sm text-primary-foreground">
                        <Play className="h-4 w-4 fill-current" />
                        {game.playable ? "Jugar ahora" : gm.seeDetails}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors">
                        {game.title}
                      </h2>
                      {game.playable && (
                        <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Monitor className="h-3.5 w-3.5" />
                          Browser
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {game.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {game.genres.map((g) => (
                        <Badge
                          key={g}
                          variant="secondary"
                          className="text-xs font-mono bg-primary/10 text-primary border-primary/20"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="gap-3">
            <a
              href="https://ninetygames.itch.io"
              target="_blank"
              rel="noreferrer"
              aria-label="Visita mi itch.io"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/itchdotio/default.svg"
                alt=""
                aria-hidden="true"
                className="h-5 w-5"
              />
              Visita mi itch.io
            </a>
          </Button>
        </div>
      </div>

      <AlertDialog open={gameToDelete !== null} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"¿Eliminar este juego por completo?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {gameToDelete
                ? `"${gameToDelete.title}" se eliminará permanentemente junto con todas sus puntuaciones y comentarios. Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Sí, eliminar juego
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
