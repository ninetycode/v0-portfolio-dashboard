"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CornerDownRight, Loader2, MessageSquare, Reply, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { StarDisplay, StarInput } from "@/components/games/star-rating"
import { useAdmin } from "@/lib/admin-context"
import { addReview, deleteReview, replyToReview } from "@/app/actions/games"
import type { GameReview } from "@/lib/games-types"

const dateFormatter = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" })

function ReviewForm({ gameId }: { gameId: string }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (rating < 1) {
      setError("Elige una puntuación (mínimo 1 estrella).")
      return
    }
    startTransition(async () => {
      const result = await addReview({ gameId, name, rating, comment })
      if (!result.success) {
        setError(result.error)
        return
      }
      setName("")
      setRating(0)
      setComment("")
      setSent(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium" id="rating-label">
          Puntuar
        </span>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-name">Nombre</Label>
        <Input
          id="review-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Tu nombre"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-comment">Comentario</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="¿Qué te pareció el juego? Cualquier feedback es bienvenido."
          required
        />
      </div>

      {error && <p className="font-mono text-sm text-destructive">{error}</p>}
      {sent && !error && <p className="font-mono text-sm text-primary">{"¡Gracias! Tu comentario fue publicado."}</p>}

      <Button type="submit" disabled={pending} className="gap-2 self-start">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
        Dejar comentario
      </Button>
    </form>
  )
}

function ReviewItem({ review, isAdmin, onDelete }: { review: GameReview; isAdmin: boolean; onDelete: () => void }) {
  const router = useRouter()
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState(review.adminReply ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const saveReply = () => {
    setError(null)
    startTransition(async () => {
      const result = await replyToReview(review.id, reply)
      if (!result.success) {
        setError(result.error)
        return
      }
      setReplying(false)
      router.refresh()
    })
  }

  return (
    <li className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-foreground">{review.name}</span>
        <span className="text-muted-foreground" aria-hidden="true">
          -
        </span>
        <StarDisplay value={review.rating} />
        <time className="ml-auto font-mono text-xs text-muted-foreground" dateTime={review.createdAt}>
          {dateFormatter.format(new Date(review.createdAt))}
        </time>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{review.comment}</p>

      {review.adminReply && !replying && (
        <div className="flex gap-2 rounded-md border border-primary/30 bg-primary/5 p-3">
          <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 font-mono text-xs text-primary">
              <Shield className="h-3 w-3" />
              Respuesta del desarrollador
            </span>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{review.adminReply}</p>
          </div>
        </div>
      )}

      {isAdmin && replying && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Escribe tu respuesta (déjalo vacío para quitarla)"
            aria-label={`Responder a ${review.name}`}
          />
          {error && <p className="font-mono text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={saveReply} disabled={pending} className="gap-2">
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Guardar respuesta
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {isAdmin && !replying && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={() => setReplying(true)}>
            <Reply className="h-3.5 w-3.5" />
            {review.adminReply ? "Editar respuesta" : "Responder"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 bg-transparent hover:border-destructive/50 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      )}
    </li>
  )
}

export function GameReviews({
  gameId,
  reviews,
  avgRating,
}: {
  gameId: string
  reviews: GameReview[]
  avgRating: number | null
}) {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [toDelete, setToDelete] = useState<GameReview | null>(null)
  const [pending, startTransition] = useTransition()

  const confirmDelete = () => {
    if (!toDelete) return
    startTransition(async () => {
      await deleteReview(toDelete.id)
      setToDelete(null)
      router.refresh()
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="flex flex-col gap-4">
        <h3 className="font-serif text-xl font-semibold">Dejar comentario</h3>
        <ReviewForm gameId={gameId} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-serif text-xl font-semibold">Comentarios</h3>
          <span className="font-mono text-sm text-muted-foreground">({reviews.length})</span>
          {avgRating !== null && (
            <span className="ml-auto flex items-center gap-2">
              <StarDisplay value={Math.round(avgRating * 2) / 2} />
              <span className="font-mono text-sm tabular-nums text-foreground">{avgRating.toFixed(1)}</span>
            </span>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center font-mono text-sm text-muted-foreground">
            {"Nadie comentó todavía. ¡Sé el primero!"}
          </p>
        ) : (
          <ul className="flex flex-col">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} isAdmin={isAdmin} onDelete={() => setToDelete(review)} />
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"¿Eliminar este comentario?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete ? `El comentario de "${toDelete.name}" y su puntuación se eliminarán permanentemente.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
