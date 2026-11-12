import { parseEmbed } from "@/lib/games-options"
import type { CoverFocus } from "@/lib/cover-focus"

export const PROJECT_STATUSES = ["idea", "in-progress", "finished", "abandoned", "future"] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const RESOURCE_TYPES = ["GDD", "Documento", "Presentación", "Video", "Página", "Descarga"] as const

export const DEFAULT_PROJECT_CATEGORIES = ["Tarea de clases", "Novela visual", "Prototipo", "Game Jam", "Sistemas", "Narrativa"]
export const DEFAULT_PROJECT_PLATFORMS = ["Navegador", "PC", "Mobile", "Consola"]

export type ProjectResource = { type: string; label: string; url: string }

export const PROJECT_BADGES = ["auto", "playable", "document", "none"] as const
export type ProjectBadge = (typeof PROJECT_BADGES)[number]
export type ResolvedBadge = "playable" | "document"

export const badgeOptions: Record<ProjectBadge, { label: string; hint: string }> = {
  auto: { label: "Automática", hint: "Documento si el embed es de Google Drive/Slides/Docs; Jugable en cualquier otro caso." },
  playable: { label: "Jugable", hint: "Muestra la etiqueta verde Jugable." },
  document: { label: "Documento", hint: "Muestra la etiqueta Documento con ícono de archivo." },
  none: { label: "Ninguna", hint: "No muestra etiqueta." },
}

export const isProjectBadge = (value: string): value is ProjectBadge => (PROJECT_BADGES as readonly string[]).includes(value)

const DOCUMENT_EMBED_HOST = /^https?:\/\/(docs\.google\.com|drive\.google\.com|view\.officeapps\.live\.com|onedrive\.live\.com|1drv\.ms)\//i

/** The badge that actually shows on the card and detail page, or null when there is none. */
export function resolveProjectBadge(project: { badge: ProjectBadge; embedUrl: string | null }): ResolvedBadge | null {
  if (project.badge === "none") return null
  if (project.badge === "playable" || project.badge === "document") return project.badge
  if (!project.embedUrl) return null
  return DOCUMENT_EMBED_HOST.test(project.embedUrl) ? "document" : "playable"
}

export interface Project {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
  status: ProjectStatus
  categories: string[]
  platforms: string[]
  tags: string[]
  projectDate: string
  coverImage: string | null
  coverFocus: CoverFocus | null
  screenshots: string[]
  embedUrl: string | null
  embedWidth: number
  embedHeight: number
  badge: ProjectBadge
  externalUrl: string | null
  resources: ProjectResource[]
  sortOrder: number
}

export type ProjectInput = {
  title: string
  slug: string
  shortDescription: string
  description: string
  status: ProjectStatus
  categories: string[]
  platforms: string[]
  tags: string[]
  projectDate: string
  coverImage: string
  coverFocus: CoverFocus | null
  screenshots: string[]
  embedUrl: string
  embedWidth: number
  embedHeight: number
  badge: ProjectBadge
  externalUrl: string
  resources: ProjectResource[]
}

export const statusConfig: Record<ProjectStatus, { label: string; labelEn: string; color: string }> = {
  idea: { label: "Idea", labelEn: "Idea", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "in-progress": { label: "En Progreso", labelEn: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  finished: { label: "Terminado", labelEn: "Finished", color: "bg-primary/20 text-primary border-primary/30" },
  abandoned: { label: "Abandonado", labelEn: "Abandoned", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  future: { label: "Idea a Futuro", labelEn: "Future Idea", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
}

export const isProjectStatus = (value: string): value is ProjectStatus =>
  (PROJECT_STATUSES as readonly string[]).includes(value)

const SLIDES_ID = /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/

/** Accepts an iframe snippet or a plain URL; Google Slides share links become their embeddable player URL. */
export function toProjectEmbed(raw: string): { url: string; width?: number; height?: number } {
  const parsed = parseEmbed(raw)
  const slidesId = parsed.url.match(SLIDES_ID)?.[1]
  if (slidesId && !/\/embed/.test(parsed.url)) {
    return {
      url: `https://docs.google.com/presentation/d/${slidesId}/embed?start=false&loop=false&delayms=60000`,
      width: parsed.width ?? 960,
      height: parsed.height ?? 569,
    }
  }
  const driveId = parsed.url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]
  if (driveId && !/\/preview/.test(parsed.url)) {
    return { url: `https://drive.google.com/file/d/${driveId}/preview`, width: parsed.width ?? 960, height: parsed.height ?? 569 }
  }
  return parsed
}
