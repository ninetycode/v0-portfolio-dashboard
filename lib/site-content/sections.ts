import { SECTION_KEYS, type SectionKey } from "./types"

export const SECTIONS: {
  key: SectionKey
  slug: string
  label: string
  viewHref: string
  description: string
}[] = [
  {
    key: "home",
    slug: "inicio",
    label: "Inicio",
    viewHref: "/#home",
    description: "Portada: título, botones, barra de estado, pie de la página de inicio y el encabezado de videojuegos destacados.",
  },
  {
    key: "about",
    slug: "sobre",
    label: "Sobre mí",
    viewHref: "/#about",
    description: "Título, párrafos y tarjetas de la sección Sobre mí.",
  },
  {
    key: "experience",
    slug: "experiencia",
    label: "Experiencia",
    viewHref: "/#experience",
    description: "Línea de tiempo. Puedes agregar, quitar y reordenar cada experiencia.",
  },
  {
    key: "tools",
    slug: "herramientas",
    label: "Herramientas",
    viewHref: "/#tools",
    description: "Inventario de herramientas: grupos, nombres y porcentaje de dominio.",
  },
  {
    key: "missions",
    slug: "misiones",
    label: "Misiones",
    viewHref: "/#contact",
    description: "Tablero de misiones, textos del formulario y enlaces de contacto.",
  },
]

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value)
}

export function sectionFromSlug(slug: string | undefined): SectionKey {
  return SECTIONS.find((section) => section.slug === slug)?.key ?? "home"
}

export function sectionByKey(key: SectionKey) {
  return SECTIONS.find((section) => section.key === key) ?? SECTIONS[0]
}
