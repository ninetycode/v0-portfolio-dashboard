export type SiteLang = "es" | "en"

/**
 * Única fuente de verdad para los datos personales que se repiten en todo el sitio.
 * Para cambiar tu título (p. ej. a "Narrative Designer" o "Guionista") editá solo este archivo.
 */
export const siteConfig = {
  name: "Mathías Andino",
  year: 2025,
  location: "Buenos Aires, Argentina",
  // Título completo tal como se lee en una presentación: "Game Designer Junior".
  role: { es: "Game Designer Junior", en: "Junior Game Designer" },
  // Solo la disciplina, sin nivel: se usa en frases como "como Game Designer" o "¿Necesitás un Game Designer?".
  discipline: { es: "Game Designer", en: "Game Designer" },
} as const

export function getRole(lang: SiteLang): string {
  return siteConfig.role[lang]
}

export function getDiscipline(lang: SiteLang): string {
  return siteConfig.discipline[lang]
}

export function getFooterTagline(lang: SiteLang): string {
  return `${siteConfig.year} | ${getRole(lang)} | ${siteConfig.location}`
}

/**
 * Reemplaza {role} y {discipline} dentro de textos editables (por ejemplo los guardados
 * desde el editor de contenido), para que sigan el título definido en siteConfig.
 */
export function resolveSiteTokens(text: string, lang: SiteLang): string {
  if (!text.includes("{")) return text
  return text.replaceAll("{role}", getRole(lang)).replaceAll("{discipline}", getDiscipline(lang))
}
