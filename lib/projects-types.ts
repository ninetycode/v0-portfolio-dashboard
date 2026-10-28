import { parseEmbed } from "@/lib/games-options"

export const PROJECT_STATUSES = ["idea", "in-progress", "finished", "abandoned", "future"] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const RESOURCE_TYPES = ["GDD", "Documento", "Presentación", "Video", "Página", "Descarga"] as const

export const DEFAULT_PROJECT_CATEGORIES = ["Tarea de clases", "Novela visual", "Prototipo", "Game Jam", "Sistemas", "Narrativa"]
export const DEFAULT_PROJECT_PLATFORMS = ["Navegador", "PC", "Mobile", "Consola"]

export type ProjectResource = { type: string; label: string; url: string }

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
  screenshots: string[]
  embedUrl: string | null
  embedWidth: number
  embedHeight: number
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
  screenshots: string[]
  embedUrl: string
  embedWidth: number
  embedHeight: number
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
  return parsed
}
