"use server"

import { revalidatePath } from "next/cache"
import { asc, desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { gameReviews, games } from "@/lib/db/schema"
import { isAdmin } from "@/lib/admin-auth"
import type { GameReview, GameSummary, GameDetail } from "@/lib/games-types"

type ActionResult = { success: true } | { success: false; error: string }

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized")
}

function revalidateGames(slug?: string) {
  revalidatePath("/games")
  revalidatePath("/")
  if (slug) revalidatePath(`/games/${slug}`)
}

const ratingStats = {
  avgRating: sql<string | null>`(select avg(${gameReviews.rating}) from ${gameReviews} where ${gameReviews.gameId} = ${games.id})`,
  reviewCount: sql<number>`(select count(*)::int from ${gameReviews} where ${gameReviews.gameId} = ${games.id})`,
}

function toAverage(value: string | null): number | null {
  if (value === null) return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null
}

export async function getGames(): Promise<GameSummary[]> {
  const rows = await db
    .select({
      id: games.id,
      slug: games.slug,
      title: games.title,
      shortDescription: games.shortDescription,
      genres: games.genres,
      platforms: games.platforms,
      coverImage: games.coverImage,
      status: games.status,
      embedUrl: games.embedUrl,
      ...ratingStats,
    })
    .from(games)
    .orderBy(asc(games.sortOrder), asc(games.createdAt))

  return rows.map((r) => ({ ...r, avgRating: toAverage(r.avgRating), playable: Boolean(r.embedUrl) }))
}

export async function getGameBySlug(slug: string): Promise<GameDetail | null> {
  const rows = await db
    .select({ game: games, ...ratingStats })
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  const reviews = await db
    .select()
    .from(gameReviews)
    .where(eq(gameReviews.gameId, row.game.id))
    .orderBy(desc(gameReviews.createdAt))

  return {
    ...row.game,
    createdAt: row.game.createdAt.toISOString(),
    avgRating: toAverage(row.avgRating),
    reviewCount: row.reviewCount,
    reviews: reviews.map(
      (r): GameReview => ({
        id: r.id,
        name: r.name,
        rating: Number(r.rating),
        comment: r.comment,
        adminReply: r.adminReply,
        adminReplyAt: r.adminReplyAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      }),
    ),
  }
}

export async function addReview(input: {
  gameId: string
  name: string
  rating: number
  comment: string
}): Promise<ActionResult> {
  const name = input.name.trim().slice(0, 60)
  const comment = input.comment.trim().slice(0, 2000)
  const rating = Number(input.rating)

  if (!name) return { success: false, error: "Escribe tu nombre." }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || rating * 2 !== Math.floor(rating * 2)) {
    return { success: false, error: "Elige una puntuación entre 1 y 5 estrellas." }
  }
  if (!comment) return { success: false, error: "Escribe un comentario." }

  const game = await db.select({ slug: games.slug }).from(games).where(eq(games.id, input.gameId)).limit(1)
  if (!game[0]) return { success: false, error: "Juego no encontrado." }

  await db.insert(gameReviews).values({ gameId: input.gameId, name, rating: rating.toFixed(1), comment })
  revalidateGames(game[0].slug)
  return { success: true }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: "No autorizado." }
  }
  const deleted = await db
    .delete(gameReviews)
    .where(eq(gameReviews.id, reviewId))
    .returning({ gameId: gameReviews.gameId })
  const gameId = deleted[0]?.gameId
  if (gameId) {
    const game = await db.select({ slug: games.slug }).from(games).where(eq(games.id, gameId)).limit(1)
    revalidateGames(game[0]?.slug)
  }
  return { success: true }
}

export async function replyToReview(reviewId: string, reply: string): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: "No autorizado." }
  }
  const text = reply.trim().slice(0, 2000)
  const updated = await db
    .update(gameReviews)
    .set({ adminReply: text || null, adminReplyAt: text ? new Date() : null })
    .where(eq(gameReviews.id, reviewId))
    .returning({ gameId: gameReviews.gameId })
  const gameId = updated[0]?.gameId
  if (gameId) {
    const game = await db.select({ slug: games.slug }).from(games).where(eq(games.id, gameId)).limit(1)
    revalidateGames(game[0]?.slug)
  }
  return { success: true }
}

export async function reorderGames(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: "No autorizado." }
  }
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx.update(games).set({ sortOrder: index }).where(eq(games.id, id))
    }
  })
  revalidateGames()
  return { success: true }
}

export async function deleteGame(gameId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: "No autorizado." }
  }
  const deleted = await db.delete(games).where(eq(games.id, gameId)).returning({ slug: games.slug })
  revalidateGames(deleted[0]?.slug)
  return { success: true }
}
