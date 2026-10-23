"use server"

import { revalidatePath } from "next/cache"
import { asc, desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { gameReviews, games } from "@/lib/db/schema"
import { isAdmin } from "@/lib/admin-auth"
import type { GameReview, GameSummary, GameDetail, GameInput } from "@/lib/games-types"
import {
  BROWSER_PLATFORM,
  DEFAULT_DOWNLOAD_PLATFORMS,
  DEFAULT_GENRES,
  STATUS_OPTIONS,
  parseEmbed,
  slugify,
  translateItchGenre,
  translateItchPlatform,
  translateItchStatus,
  uniqueTags,
  type GameTaxonomy,
} from "@/lib/games-options"

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

export async function getGameTaxonomy(): Promise<GameTaxonomy> {
  const rows = await db.select({ genres: games.genres, platforms: games.platforms }).from(games)
  const byUsage = (values: string[]) => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const value of values) {
      const key = value.trim().toLowerCase()
      if (!key) continue
      const entry = counts.get(key)
      counts.set(key, { label: entry?.label ?? value.trim(), count: (entry?.count ?? 0) + 1 })
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).map((e) => e.label)
  }
  return {
    genres: uniqueTags([...byUsage(rows.flatMap((r) => r.genres)), ...DEFAULT_GENRES]),
    platforms: uniqueTags([...DEFAULT_DOWNLOAD_PLATFORMS, ...byUsage(rows.flatMap((r) => r.platforms))]).filter(
      (p) => p.toLowerCase() !== BROWSER_PLATFORM.toLowerCase(),
    ),
  }
}

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value)

function cleanGameInput(input: GameInput) {
  const url = (value: string) => {
    const trimmed = value.trim().slice(0, 1000)
    return isHttpUrl(trimmed) ? trimmed : null
  }
  return {
    title: input.title.trim().slice(0, 160),
    slug: slugify(input.slug),
    shortDescription: input.shortDescription.trim().slice(0, 500),
    description: input.description.trim().slice(0, 10000),
    controls: input.controls.trim().slice(0, 3000),
    genres: uniqueTags(input.genres.map((v) => v.trim().slice(0, 40))).slice(0, 10),
    platforms: uniqueTags(input.platforms.map((v) => v.trim().slice(0, 40))).slice(0, 10),
    engine: input.engine.trim().slice(0, 80) || null,
    status: input.status.trim().slice(0, 80) || STATUS_OPTIONS[0],
    embedUrl: url(input.embedUrl),
    embedWidth: Math.max(320, Math.min(2400, Number(input.embedWidth) || 1280)),
    embedHeight: Math.max(240, Math.min(1600, Number(input.embedHeight) || 740)),
    externalUrl: url(input.externalUrl),
    coverImage: url(input.coverImage),
    screenshots: uniqueTags(input.screenshots.map((v) => v.trim()).filter(isHttpUrl)).slice(0, 12),
    docLinks: input.docLinks
      .map((link) => ({ label: link.label.trim().slice(0, 100), url: link.url.trim().slice(0, 1000) }))
      .filter((link) => link.label && isHttpUrl(link.url))
      .slice(0, 12),
  }
}

function validateGame(data: ReturnType<typeof cleanGameInput>): string | null {
  if (!data.title) return "Falta el título."
  if (!data.slug) return "Falta el slug (URL del juego)."
  if (data.platforms.length === 0) return "Indica si el juego se juega en el navegador, es descargable o ambos."
  const isBrowser = data.platforms.some((p) => p.toLowerCase() === BROWSER_PLATFORM.toLowerCase())
  if (isBrowser && !data.embedUrl) return "Los juegos de navegador necesitan el iframe o la URL del embed."
  if (!isBrowser && !data.externalUrl) return "Los juegos descargables necesitan un enlace de descarga."
  return null
}

export async function importItchGame(input: {
  itchUrl: string
  embedCode: string
}): Promise<{ success: true; data: Partial<GameInput> } | { success: false; error: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const itchUrl = input.itchUrl.trim()
  if (!/^https?:\/\/(www\.)?[^/]+\.itch\.io\/\S+/i.test(itchUrl)) {
    return { success: false, error: "Introduce una URL pública válida de itch.io (https://usuario.itch.io/juego)." }
  }
  const embed = input.embedCode.trim() ? parseEmbed(input.embedCode) : null
  if (embed && !isHttpUrl(embed.url)) return { success: false, error: "El iframe no parece válido. Cópialo completo desde itch.io." }

  let html = ""
  try {
    const res = await fetch(itchUrl, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return { success: false, error: `itch.io respondió ${res.status}. ¿La página es pública?` }
    html = await res.text()
  } catch {
    return { success: false, error: "No se pudo leer la página de itch.io. Comprueba la URL." }
  }

  const decode = (value: string) =>
    value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
  const meta = (property: string) =>
    decode(html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)`, "i"))?.[1] ?? "")
  const infoRow = (label: string) => {
    const cell = html.match(new RegExp(`<td>${label}</td>\\s*<td>([\\s\\S]*?)</td>`, "i"))?.[1]
    if (!cell) return []
    return cell.replace(/<[^>]+>/g, "").split(",").map(decode).filter(Boolean)
  }

  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? meta("og:title")).replace(/\s+by\s+.*$/i, "")) || "Juego sin título"
  const description = meta("og:description") || meta("description")
  const coverImage = meta("og:image")
  const genres = uniqueTags(infoRow("Genre").map(translateItchGenre))
  const platforms = uniqueTags(infoRow("Platforms").map(translateItchPlatform))
  const status = infoRow("Status").map(translateItchStatus)[0]
  const engine = infoRow("Made with")[0]

  const data: Partial<GameInput> = {
    title,
    slug: slugify(title) || "nuevo-juego",
    externalUrl: itchUrl,
    docLinks: [{ label: "Página en itch.io", url: itchUrl }],
  }
  if (description) {
    data.description = description
    data.shortDescription = description.slice(0, 500)
  }
  if (coverImage) {
    data.coverImage = coverImage
    data.screenshots = [coverImage]
  }
  if (genres.length) data.genres = genres
  if (status) data.status = status
  if (engine) data.engine = engine
  if (embed) {
    data.embedUrl = embed.url
    if (embed.width) data.embedWidth = embed.width
    if (embed.height) data.embedHeight = embed.height
  }
  const resolvedPlatforms = embed ? uniqueTags([BROWSER_PLATFORM, ...platforms]) : platforms
  if (resolvedPlatforms.length) data.platforms = resolvedPlatforms
  return { success: true, data }
}

export async function createGame(input: GameInput): Promise<ActionResult & { slug?: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const data = cleanGameInput(input)
  const invalid = validateGame(data)
  if (invalid) return { success: false, error: invalid }
  const existing = await db.select({ id: games.id }).from(games).where(eq(games.slug, data.slug)).limit(1)
  if (existing[0]) return { success: false, error: `Ya existe un juego con el slug "${data.slug}". Cámbialo.` }
  try {
    await db.insert(games).values(data)
    revalidateGames(data.slug)
    return { success: true, slug: data.slug }
  } catch {
    return { success: false, error: "No se pudo crear el juego." }
  }
}

export async function updateGame(gameId: string, input: GameInput): Promise<ActionResult & { slug?: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const data = cleanGameInput(input)
  const invalid = validateGame(data)
  if (invalid) return { success: false, error: invalid }
  const clash = await db.select({ id: games.id }).from(games).where(eq(games.slug, data.slug)).limit(1)
  if (clash[0] && clash[0].id !== gameId) return { success: false, error: `Ya existe otro juego con el slug "${data.slug}".` }
  try {
    const old = await db.select({ slug: games.slug }).from(games).where(eq(games.id, gameId)).limit(1)
    await db.update(games).set(data).where(eq(games.id, gameId))
    revalidateGames(old[0]?.slug)
    revalidateGames(data.slug)
    return { success: true, slug: data.slug }
  } catch {
    return { success: false, error: "No se pudo guardar el juego." }
  }
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
