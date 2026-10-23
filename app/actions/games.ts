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
  avgRating: sql<string | null>`(select avg(gr.rating) from game_reviews gr where gr.game_id = "games"."id")`,
  reviewCount: sql<number>`(select count(*)::int from game_reviews gr where gr.game_id = "games"."id")`,
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
      releaseType: games.releaseType,
      embedUrl: games.embedUrl,
      ...ratingStats,
    })
    .from(games)
    .orderBy(asc(games.sortOrder), asc(games.createdAt))

  return rows.map((r) => ({ ...r, avgRating: toAverage(r.avgRating), playable: Boolean(r.embedUrl) }))
}

export async function getGameById(id: string): Promise<GameDetail | null> {
  const row = await db.select({ slug: games.slug }).from(games).where(eq(games.id, id)).limit(1)
  return row[0] ? getGameBySlug(row[0].slug) : null
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

type GameInput = {
  title: string
  slug: string
  shortDescription: string
  description: string
  controls: string
  genres: string[]
  platforms: string[]
  engine: string
  status: string
  releaseType: string
  embedUrl: string
  embedWidth: number
  embedHeight: number
  externalUrl: string
  coverImage: string
  screenshots: string[]
  docLinks: { label: string; url: string }[]
}

function cleanGameInput(input: GameInput) {
  return {
    title: input.title.trim().slice(0, 160),
    slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 100),
    shortDescription: input.shortDescription.trim().slice(0, 500),
    description: input.description.trim().slice(0, 10000),
    controls: input.controls.trim().slice(0, 3000),
    genres: input.genres.map((v) => v.trim()).filter(Boolean).slice(0, 10),
    platforms: input.platforms.map((v) => v.trim()).filter(Boolean).slice(0, 10),
    engine: input.engine.trim().slice(0, 80) || null,
    status: input.status.trim().slice(0, 80) || "Released",
    releaseType: input.releaseType,
    embedUrl: input.embedUrl.trim().slice(0, 1000) || null,
    embedWidth: Math.max(320, Math.min(2400, Number(input.embedWidth) || 1280)),
    embedHeight: Math.max(240, Math.min(1600, Number(input.embedHeight) || 740)),
    externalUrl: input.externalUrl.trim().slice(0, 1000) || null,
    coverImage: input.coverImage.trim().slice(0, 1000) || null,
    screenshots: input.screenshots.map((v) => v.trim()).filter(Boolean).slice(0, 12),
    docLinks: input.docLinks.map((link) => ({ label: link.label.trim().slice(0, 100), url: link.url.trim().slice(0, 1000) })).filter((link) => link.label && link.url).slice(0, 12),
  }
}

export async function importItchGame(input: { itchUrl: string; embedCode: string }): Promise<{ success: true; data: GameInput } | { success: false; error: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const itchUrl = input.itchUrl.trim()
  if (!/^https?:\/\/(www\.)?[^/]+\.itch\.io\//i.test(itchUrl)) return { success: false, error: "Introduce una URL pública válida de itch.io." }
  const iframe = input.embedCode.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i)
  const embedUrl = iframe?.[1] ?? input.embedCode.trim()
  if (!/^https?:\/\//i.test(embedUrl)) return { success: false, error: "Pega el iframe completo de itch.io." }

  let html = ""
  try { html = await (await fetch(itchUrl, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) })).text() } catch { return { success: false, error: "No se pudo leer la página de itch.io. Comprueba la URL." } }
  const meta = (property: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)`, "i"))?.[1]?.trim() ?? ""
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? meta("og:title")).replace(/\s+by\s+.*/i, "").trim() || "Juego sin título"
  const description = meta("og:description") || meta("description") || "Un juego jugable desde el navegador."
  const coverImage = meta("og:image")
  const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "nuevo-juego"
  return { success: true, data: { title, slug, shortDescription: description.slice(0, 500), description, controls: "", genres: ["Plataformas"], platforms: ["Navegador"], engine: "", status: "Released", releaseType: "browser", embedUrl, embedWidth: 1280, embedHeight: 740, externalUrl: itchUrl, coverImage, screenshots: coverImage ? [coverImage] : [], docLinks: [{ label: "Página en itch.io", url: itchUrl }] } }
}

export async function createGame(input: GameInput): Promise<ActionResult & { slug?: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const data = cleanGameInput(input)
  if (!data.title || !data.slug) return { success: false, error: "Completa el título y el slug." }
  if (data.releaseType === "browser" && !data.embedUrl) return { success: false, error: "Los juegos de navegador necesitan una URL de embed." }
  try { await db.insert(games).values(data); revalidateGames(data.slug); return { success: true, slug: data.slug } } catch { return { success: false, error: "No se pudo crear el juego. El slug puede estar repetido." } }
}

export async function updateGame(gameId: string, input: GameInput): Promise<ActionResult & { slug?: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const data = cleanGameInput(input)
  if (!data.title || !data.slug) return { success: false, error: "Completa el título y el slug." }
  if (data.releaseType === "browser" && !data.embedUrl) return { success: false, error: "Los juegos de navegador necesitan una URL de embed." }
  try { const old = await db.select({ slug: games.slug }).from(games).where(eq(games.id, gameId)).limit(1); await db.update(games).set(data).where(eq(games.id, gameId)); revalidateGames(old[0]?.slug); revalidateGames(data.slug); return { success: true, slug: data.slug } } catch { return { success: false, error: "No se pudo guardar el juego." } }
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
