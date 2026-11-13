export type SiteLang = "es" | "en"

// Solo la disciplina, sin nivel: se usa en frases como "como Game Designer" o "Clase: Game Designer".
const discipline = { es: "Game Designer", en: "Game Designer" }
// Nivel de seniority: se muestra en "Rango: Junior" y se une a la disciplina para formar el título completo.
const rank = { es: "Junior", en: "Junior" }

/**
 * Única fuente de verdad para los datos personales que se repiten en todo el sitio.
 * Para cambiar tu título (p. ej. a "Narrative Designer" o "Guionista") editá solo este archivo.
 */
export const siteConfig = {
  name: "Mathías Andino",
  year: 2025,
  location: "Buenos Aires, Argentina",
  discipline,
  rank,
  // Título completo tal como se lee en una presentación: "Game Designer Junior" / "Junior Game Designer".
  role: {
    es: `${discipline.es} ${rank.es}`.trim(),
    en: `${rank.en} ${discipline.en}`.trim(),
  },
}

export function getRole(lang: SiteLang): string {
  return siteConfig.role[lang]
}

export function getDiscipline(lang: SiteLang): string {
  return siteConfig.discipline[lang]
}

export function getRank(lang: SiteLang): string {
  return siteConfig.rank[lang]
}

export function getFooterTagline(lang: SiteLang): string {
  return `${siteConfig.year} | ${getRole(lang)} | ${siteConfig.location}`
}

const SITE_TOKEN = /\{(role|discipline|rank)\}/gi

/**
 * Reemplaza {role}, {discipline} y {rank} dentro de textos editables (por ejemplo los guardados
 * desde el editor de contenido o la insignia de contacto), para que sigan el título definido en
 * siteConfig. Acepta mayúsculas ({ROLE}) porque la insignia se muestra en versalitas.
 */
export function resolveSiteTokens(text: string, lang: SiteLang): string {
  if (!text.includes("{")) return text
  return text.replace(SITE_TOKEN, (_match, token: string) => {
    const key = token.toLowerCase()
    if (key === "role") return getRole(lang)
    if (key === "discipline") return getDiscipline(lang)
    return getRank(lang)
  })
}
