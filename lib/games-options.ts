export const BROWSER_PLATFORM = "Navegador"

export const DEFAULT_GENRES = [
  "Plataformas",
  "Metroidvania",
  "Acción",
  "Aventura",
  "Puzle",
  "RPG",
  "Roguelike",
  "Ritmo",
  "Disparos",
  "Estrategia",
  "Simulación",
  "Terror",
  "Supervivencia",
  "Novela visual",
  "Arcade",
]

export const DEFAULT_DOWNLOAD_PLATFORMS = ["Windows", "macOS", "Linux", "Android", "iOS"]

export const STATUS_OPTIONS = ["Lanzado", "En desarrollo", "Demo", "Prototipo", "Game jam", "Early access"]

export type GameTaxonomy = { genres: string[]; platforms: string[] }

const ITCH_GENRES: Record<string, string> = {
  platformer: "Plataformas",
  action: "Acción",
  adventure: "Aventura",
  puzzle: "Puzle",
  rhythm: "Ritmo",
  "role playing": "RPG",
  shooter: "Disparos",
  strategy: "Estrategia",
  simulation: "Simulación",
  survival: "Supervivencia",
  "visual novel": "Novela visual",
  fighting: "Lucha",
  racing: "Carreras",
  sports: "Deportes",
  "card game": "Cartas",
  educational: "Educativo",
  "interactive fiction": "Ficción interactiva",
}

const ITCH_STATUS: Record<string, string> = {
  released: "Lanzado",
  "in development": "En desarrollo",
  prototype: "Prototipo",
  "on hold": "En pausa",
  canceled: "Cancelado",
}

const ITCH_PLATFORMS: Record<string, string> = {
  html5: BROWSER_PLATFORM,
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
  ios: "iOS",
}

export const translateItchGenre = (value: string) => ITCH_GENRES[value.toLowerCase()] ?? value
export const translateItchStatus = (value: string) => ITCH_STATUS[value.toLowerCase()] ?? value
export const translateItchPlatform = (value: string) => ITCH_PLATFORMS[value.toLowerCase()] ?? value

export function uniqueTags(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

export function parseEmbed(value: string) {
  const trimmed = value.trim()
  if (!/<iframe/i.test(trimmed)) return { url: trimmed }
  const attr = (name: string) => trimmed.match(new RegExp(`${name}=["']?([^"'\\s>]+)`, "i"))?.[1]
  const width = Number(attr("width"))
  const height = Number(attr("height"))
  return {
    url: attr("src") ?? "",
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
  }
}
