import { siteBaseUrl } from "@/lib/site-url"

export const CONTACT_LINKS_KEY = "contact_links"

export const CONTACT_ICONS = [
  { id: "mail", label: "Correo" },
  { id: "itchio", label: "itch.io" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "github", label: "GitHub" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "gamepad", label: "Juegos" },
  { id: "house", label: "Portfolio" },
  { id: "folder", label: "Proyectos" },
  { id: "book", label: "Blog" },
  { id: "globe", label: "Web" },
  { id: "link", label: "Enlace" },
] as const

export type ContactIconId = (typeof CONTACT_ICONS)[number]["id"]

const ICON_IDS = new Set<string>(CONTACT_ICONS.map((icon) => icon.id))

export type ContactHeader = {
  avatarUrl: string
  displayName: string
  roleBadge: string
  bio: string
}

export type ContactLink = {
  id: string
  slug: string
  title: string
  subtitle: string
  url: string
  icon: string
  category: string
  featured: boolean
  active: boolean
  sortOrder: number
}

export type ContactLinksContent = {
  header: ContactHeader
  links: ContactLink[]
}

export type ContactLinksResult =
  | { ok: true; value: ContactLinksContent }
  | { ok: false; error: string }

// URLs taken from the mission-board socials in lib/site-content/defaults.ts,
// plus the portfolio routes already used by the navbar.
export const defaultContactLinks: ContactLinksContent = {
  header: {
    avatarUrl: "/profile-avatar.jpg",
    displayName: "Mathías Andino",
    roleBadge: "Game Narrative Designer Junior",
    bio: "Diseño narrativa y sistemas de juego en Buenos Aires. Escribime, o entrá al portfolio, los juegos y el blog.",
  },
  links: [
    {
      id: "link-correo",
      slug: "correo",
      title: "Correo",
      subtitle: "mathias.gamedesigner@gmail.com",
      url: "mailto:mathias.gamedesigner@gmail.com",
      icon: "mail",
      category: "Contacto",
      featured: true,
      active: true,
      sortOrder: 4,
    },
    {
      id: "link-portfolio",
      slug: "portfolio",
      title: "Portfolio",
      subtitle: "Centro de mando",
      url: "/",
      icon: "house",
      category: "Sitio",
      featured: true,
      active: true,
      sortOrder: 0,
    },
    {
      id: "link-juegos",
      slug: "juegos",
      title: "Juegos",
      subtitle: "Jugables y fichas",
      url: "/games",
      icon: "gamepad",
      category: "Sitio",
      featured: false,
      active: true,
      sortOrder: 1,
    },
    {
      id: "link-proyectos",
      slug: "proyectos",
      title: "Proyectos",
      subtitle: "Diseño y prototipos",
      url: "/proyectos",
      icon: "folder",
      category: "Sitio",
      featured: false,
      active: true,
      sortOrder: 2,
    },
    {
      id: "link-blog",
      slug: "blog",
      title: "Blog",
      subtitle: "Devlogs y notas",
      url: "/blog",
      icon: "book",
      category: "Sitio",
      featured: false,
      active: true,
      sortOrder: 3,
    },
    {
      id: "link-linkedin",
      slug: "linkedin",
      title: "LinkedIn",
      subtitle: "",
      url: "https://www.linkedin.com/in/mathias-andino/",
      icon: "linkedin",
      category: "Redes",
      featured: false,
      active: true,
      sortOrder: 5,
    },
    {
      id: "link-itch",
      slug: "itch",
      title: "itch.io",
      subtitle: "",
      url: "https://ninetygames.itch.io/",
      icon: "itchio",
      category: "Redes",
      featured: false,
      active: true,
      sortOrder: 6,
    },
    {
      id: "link-github",
      slug: "github",
      title: "GitHub",
      subtitle: "",
      url: "https://github.com/ninetycode",
      icon: "github",
      category: "Redes",
      featured: false,
      active: true,
      sortOrder: 7,
    },
    {
      id: "link-instagram",
      slug: "instagram",
      title: "Instagram",
      subtitle: "",
      url: "https://www.instagram.com/mathiasandino.ar",
      icon: "instagram",
      category: "Redes",
      featured: false,
      active: true,
      sortOrder: 8,
    },
    {
      id: "link-youtube",
      slug: "youtube",
      title: "YouTube",
      subtitle: "",
      url: "https://www.youtube.com/@Mattez",
      icon: "youtube",
      category: "Redes",
      featured: false,
      active: true,
      sortOrder: 9,
    },
    {
      id: "link-x",
      slug: "x",
      title: "X",
      subtitle: "",
      url: "https://x.com/mathiasandinoar",
      icon: "x",
      category: "Redes",
      featured: false,
      active: true,
      sortOrder: 10,
    },
  ],
}

export function slugifyLinkTitle(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return slug || "enlace"
}

export function isSafeLinkUrl(value: string): boolean {
  if (!value || value.length > 500) return false
  if (/[\u0000-\u001F\u007F\s\\]/.test(value) || /%0d|%0a/i.test(value)) return false
  if (/^mailto:\S+@\S+$/i.test(value)) return true
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("..")
}

export function resolveRedirectTarget(url: string, requestUrl: string): string | null {
  if (!isSafeLinkUrl(url)) return null
  if (url.startsWith("/")) return new URL(url, requestUrl).toString()
  return url
}

function categoryRank(category: string): number {
  const key = category.trim().toLocaleLowerCase("es")
  if (key === "sitio") return 0
  if (key === "contacto") return 1
  if (key === "redes") return 2
  if (!key) return 4
  return 3
}

export function visibleContactLinks(data: ContactLinksContent): ContactLink[] {
  return data.links
    .filter((link) => link.active)
    .toSorted((a, b) => {
      const byCategory = categoryRank(a.category) - categoryRank(b.category)
      if (byCategory !== 0) return byCategory
      return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "es")
    })
}

export function findActiveContactLink(data: ContactLinksContent, slug: string): ContactLink | undefined {
  return data.links.find((link) => link.active && link.slug === slug)
}

export function contactProfileSchema(data: ContactLinksContent, baseUrl = siteBaseUrl()) {
  const visible = visibleContactLinks(data)
  const avatar = data.header.avatarUrl.startsWith("/")
    ? `${baseUrl}${data.header.avatarUrl}`
    : data.header.avatarUrl
  const sameAs = visible.flatMap((link) => (/^https?:\/\//i.test(link.url) ? [link.url] : []))
  const mail = visible.find((link) => link.url.toLowerCase().startsWith("mailto:"))
  const email = mail ? mail.url.replace(/^mailto:/i, "").split("?")[0] : undefined

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${baseUrl}/contactos`,
    mainEntity: {
      "@type": "Person",
      name: data.header.displayName,
      jobTitle: data.header.roleBadge,
      description: data.header.bio,
      url: baseUrl,
      ...(avatar ? { image: avatar } : {}),
      ...(email ? { email } : {}),
      sameAs,
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return ""
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max)
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function sortOrderOf(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(9999, Math.round(n)))
}

function cleanId(value: unknown, fallback: string): string {
  if (typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value)) return value
  return fallback
}

function isSafeAvatar(value: string): boolean {
  if (!value) return true
  if (value.length > 500 || /[\s\\]/.test(value) || value.includes("..")) return false
  if (value.startsWith("/") && !value.startsWith("//")) return true
  return /^https:\/\/\S+$/i.test(value)
}

function normalizeIcon(value: unknown): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : ""
  if (raw === "itch") return "itchio"
  return ICON_IDS.has(raw) ? raw : ""
}

function uniqueSlug(base: string, used: Set<string>): string {
  const seed = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base) ? base.slice(0, 60) : "enlace"
  let slug = seed
  let n = 2
  while (used.has(slug)) {
    const suffix = `-${n}`
    slug = `${seed.slice(0, Math.max(1, 60 - suffix.length))}${suffix}`
    n += 1
  }
  used.add(slug)
  return slug
}

export function sanitizeContactLinks(data: unknown, mode: "read" | "write" = "read"): ContactLinksResult {
  if (!isRecord(data)) {
    if (mode === "write") return { ok: false, error: "No se pudo leer la sección." }
    return { ok: true, value: structuredClone(defaultContactLinks) }
  }

  const errors: string[] = []
  const base = defaultContactLinks.header
  const headerSrc = isRecord(data.header) ? data.header : null
  if (!headerSrc && mode === "write") errors.push("Falta la cabecera.")

  const displayName = cleanText(headerSrc?.displayName, 80)
    const roleBadge =
      headerSrc && typeof headerSrc.roleBadge === "string" ? cleanText(headerSrc.roleBadge, 80) : base.roleBadge
  const bio = headerSrc && typeof headerSrc.bio === "string" ? cleanText(headerSrc.bio, 600) : base.bio
  const avatarRaw = cleanText(headerSrc?.avatarUrl, 500)

  if (mode === "write" && !displayName) errors.push("Completá el nombre.")
  if (avatarRaw && !isSafeAvatar(avatarRaw)) {
    if (mode === "write") errors.push("La imagen tiene que ser una ruta del sitio o una URL https.")
  }

  let avatarUrl = base.avatarUrl
  if (headerSrc && typeof headerSrc.avatarUrl === "string") {
    if (!avatarRaw) avatarUrl = ""
    else if (isSafeAvatar(avatarRaw)) avatarUrl = avatarRaw
  }
  const header: ContactHeader = {
    avatarUrl,
    displayName: displayName || base.displayName,
    roleBadge,
    bio,
  }

  const rawLinks = Array.isArray(data.links) ? data.links : null
  if (!rawLinks && mode === "write") errors.push("Falta la lista de enlaces.")
  if (rawLinks && rawLinks.length > 30 && mode === "write") errors.push("Podés guardar hasta 30 enlaces.")

  const usedIds = new Set<string>()
  const usedSlugs = new Set<string>()
  const links: ContactLink[] = []

  for (const [index, item] of (rawLinks ?? []).slice(0, 30).entries()) {
    const src = isRecord(item) ? item : {}
    const title = cleanText(src.title, 80)
    if (!title) {
      if (mode === "write") errors.push("Cada enlace necesita un título.")
      continue
    }

    let id = cleanId(src.id, `link-${index + 1}`)
    if (usedIds.has(id)) {
      let n = index + 2
      id = `link-${n}`
      while (usedIds.has(id) && n < 200) {
        n += 1
        id = `link-${n}`
      }
    }
    usedIds.add(id)

    let slug = cleanText(src.slug, 60).toLowerCase()
    const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    if (!slugOk) {
      if (mode === "write") {
        errors.push(`El slug de «${title}» solo puede usar minúsculas, números y guiones.`)
      }
      slug = slugifyLinkTitle(title)
    }
    if (usedSlugs.has(slug)) {
      if (mode === "write") errors.push(`Hay dos enlaces con el slug «${slug}».`)
      slug = uniqueSlug(slug, usedSlugs)
    } else {
      usedSlugs.add(slug)
    }

    const url = cleanText(src.url, 500)
    if (!isSafeLinkUrl(url)) {
      if (mode === "write") {
        errors.push(
          url
            ? `La URL de «${title}» tiene que empezar con https://, http://, mailto: o /.`
            : `Completá la URL de «${title}».`,
        )
      }
      continue
    }

    const icon = normalizeIcon(src.icon)
    if (!icon && mode === "write") errors.push(`Elegí un ícono para «${title}».`)

    links.push({
      id,
      slug,
      title,
      subtitle: cleanText(src.subtitle, 140),
      url,
      icon: icon || "link",
      category: cleanText(src.category, 40),
      featured: flag(src.featured, false),
      active: flag(src.active, true),
      sortOrder: sortOrderOf(src.sortOrder, index),
    })
  }

  links.sort((a, b) => a.sortOrder - b.sortOrder)
  links.forEach((link, index) => {
    link.sortOrder = index
  })

  if (mode === "write" && errors.length > 0) return { ok: false, error: errors[0] }
  return { ok: true, value: { header, links } }
}
