import { defaultSiteContent } from "./defaults"
import type {
  AboutContent,
  AboutIcon,
  AboutStat,
  Bilingual,
  Difficulty,
  ExperienceContent,
  ExperienceItem,
  ExperienceType,
  HomeContent,
  LucideTool,
  MissionsContent,
  Quest,
  QuestKind,
  SectionKey,
  SiteContent,
  SocialIcon,
  SocialLink,
  ToolGroup,
  ToolIcon,
  ToolItem,
  ToolsContent,
} from "./types"
import { plainText, sanitizeRichText } from "./rich-text"
import { ABOUT_ICONS, DIFFICULTIES, EXPERIENCE_TYPES, LUCIDE_TOOLS, QUEST_KINDS, SOCIAL_ICONS } from "./types"

export type SanitizeResult<T> = { ok: true; value: T } | { ok: false; error: string }

type Mode = "read" | "write"

const SHORT = 4000
const MEDIUM = 8000
const LONG = 20000

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function str(value: unknown, fallback: string, max: number): string {
  if (typeof value !== "string") return fallback
  const clean = sanitizeRichText(value)
  if (clean.length <= max) return clean
  return sanitizeRichText(clean.slice(0, max))
}

function bi(value: unknown, fallback: Bilingual, max: number): Bilingual {
  const src = isRecord(value) ? value : {}
  return {
    es: str(src.es, fallback.es, max),
    en: str(src.en, fallback.en, max),
  }
}

function biList(value: unknown, fallback: Bilingual[], maxItems: number, maxLen: number): Bilingual[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }))
  return value.slice(0, maxItems).map((item, index) => bi(item, fallback[index] ?? { es: "", en: "" }, maxLen))
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback
}

function cleanId(value: unknown, fallback: string): string {
  if (typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value)) return value
  return fallback
}

function uniqueIds<T extends { id: string }>(items: T[], prefix: string): T[] {
  const seen = new Set<string>()
  return items.map((item, index) => {
    let id = item.id || `${prefix}-${index + 1}`
    if (seen.has(id)) {
      let n = index + 1
      while (seen.has(`${prefix}-${n}`)) n += 1
      id = `${prefix}-${n}`
    }
    seen.add(id)
    return { ...item, id }
  })
}

function percent(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

function hrefOf(value: unknown, fallback: string, mode: Mode, label: string, errors: string[]): string {
  const raw = typeof value === "string" ? value.trim().slice(0, 500) : ""
  if (/^https?:\/\/\S+$/i.test(raw) || /^mailto:\S+$/i.test(raw)) return raw
  if (mode === "write") {
    errors.push(`El enlace «${label || "sin nombre"}» tiene que empezar por https:// o mailto:.`)
  }
  return fallback || "https://example.com"
}

function brandSlug(value: unknown, fallback: string, mode: Mode, errors: string[]): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) : ""
  if (raw) return raw
  if (mode === "write") errors.push("Escribe el identificador del logo, por ejemplo godotengine.")
  return fallback || "godotengine"
}

function toolIcon(value: unknown, fallback: ToolIcon, mode: Mode, errors: string[]): ToolIcon {
  if (!isRecord(value)) return fallback
  if (value.type === "lucide") {
    return { type: "lucide", name: oneOf(value.name, LUCIDE_TOOLS, fallback.type === "lucide" ? fallback.name : "wrench") }
  }
  if (value.type === "brand") {
    const fallbackSlug = fallback.type === "brand" ? fallback.slug : "godotengine"
    return { type: "brand", slug: brandSlug(value.slug, fallbackSlug, mode, errors) }
  }
  return fallback
}

function sanitizeHome(data: Record<string, unknown>, base: HomeContent): HomeContent {
  return {
    badge: bi(data.badge, base.badge, SHORT),
    level: str(data.level, base.level, SHORT),
    title1: bi(data.title1, base.title1, SHORT),
    title2: bi(data.title2, base.title2, SHORT),
    title3: bi(data.title3, base.title3, SHORT),
    subtitle: bi(data.subtitle, base.subtitle, SHORT),
    classLabel: bi(data.classLabel, base.classLabel, SHORT),
    spec: bi(data.spec, base.spec, SHORT),
    region: bi(data.region, base.region, SHORT),
    ctaGames: bi(data.ctaGames, base.ctaGames, SHORT),
    ctaProjects: bi(data.ctaProjects, base.ctaProjects, SHORT),
    ctaContact: bi(data.ctaContact, base.ctaContact, SHORT),
    scrollDown: bi(data.scrollDown, base.scrollDown, SHORT),
    objectiveLabel: bi(data.objectiveLabel, base.objectiveLabel, SHORT),
    objectiveValue: bi(data.objectiveValue, base.objectiveValue, SHORT),
    locationLabel: bi(data.locationLabel, base.locationLabel, SHORT),
    locationValue: bi(data.locationValue, base.locationValue, SHORT),
    footerCredit: bi(data.footerCredit, base.footerCredit, SHORT),
    footerName: bi(data.footerName, base.footerName, SHORT),
    footerTagline: bi(data.footerTagline, base.footerTagline, MEDIUM),
    featuredKicker: bi(data.featuredKicker, base.featuredKicker, SHORT),
    featuredTitle: bi(data.featuredTitle, base.featuredTitle, SHORT),
    featuredSubtitle: bi(data.featuredSubtitle, base.featuredSubtitle, MEDIUM),
    featuredEmpty: bi(data.featuredEmpty, base.featuredEmpty, SHORT),
    featuredSeeAll: bi(data.featuredSeeAll, base.featuredSeeAll, SHORT),
  }
}

function sanitizeAbout(data: Record<string, unknown>, base: AboutContent): AboutContent {
  const stats = Array.isArray(data.stats) ? data.stats.slice(0, 8) : base.stats
  return {
    label: bi(data.label, base.label, SHORT),
    titlePart1: bi(data.titlePart1, base.titlePart1, MEDIUM),
    titleYear: str(data.titleYear, base.titleYear, SHORT),
    paragraphs: biList(data.paragraphs, base.paragraphs, 12, LONG),
    stats: uniqueIds(
      stats.map((item, index): AboutStat => {
        const fallback = base.stats[index] ?? base.stats[0]
        const src = isRecord(item) ? item : {}
        return {
          id: cleanId(src.id, fallback?.id ?? `stat-${index + 1}`),
          icon: oneOf<AboutIcon>(src.icon, ABOUT_ICONS, fallback?.icon ?? "gamepad"),
          useGameCount: flag(src.useGameCount, fallback?.useGameCount ?? false),
          title: bi(src.title, fallback?.title ?? { es: "", en: "" }, SHORT),
          countSuffix: bi(src.countSuffix, fallback?.countSuffix ?? { es: "juegos", en: "games" }, SHORT),
          description: bi(src.description, fallback?.description ?? { es: "", en: "" }, MEDIUM),
        }
      }),
      "stat",
    ),
  }
}

function sanitizeExperience(data: Record<string, unknown>, base: ExperienceContent): ExperienceContent {
  const items = Array.isArray(data.items) ? data.items.slice(0, 24) : base.items
  return {
    title: bi(data.title, base.title, SHORT),
    subtitle: bi(data.subtitle, base.subtitle, MEDIUM),
    typeWork: bi(data.typeWork, base.typeWork, SHORT),
    typeProject: bi(data.typeProject, base.typeProject, SHORT),
    typeMilestone: bi(data.typeMilestone, base.typeMilestone, SHORT),
    achievements: bi(data.achievements, base.achievements, SHORT),
    readMore: bi(data.readMore, base.readMore, SHORT),
    selectPrompt: bi(data.selectPrompt, base.selectPrompt, MEDIUM),
    items: uniqueIds(
      items.map((item, index): ExperienceItem => {
        const fallback = base.items[index]
        const src = isRecord(item) ? item : {}
        return {
          id: cleanId(src.id, fallback?.id ?? `exp-${index + 1}`),
          year: str(src.year, fallback?.year ?? "", SHORT),
          type: oneOf<ExperienceType>(src.type, EXPERIENCE_TYPES, fallback?.type ?? "work"),
          title: bi(src.title, fallback?.title ?? { es: "", en: "" }, SHORT),
          company: bi(src.company, fallback?.company ?? { es: "", en: "" }, SHORT),
          overview: bi(src.overview, fallback?.overview ?? { es: "", en: "" }, LONG),
          highlights: biList(src.highlights, fallback?.highlights ?? [], 16, MEDIUM),
          showReadMore: flag(src.showReadMore, fallback?.showReadMore ?? false),
        }
      }),
      "exp",
    ),
  }
}

function sanitizeTools(data: Record<string, unknown>, base: ToolsContent, mode: Mode, errors: string[]): ToolsContent {
  const groups = Array.isArray(data.groups) ? data.groups.slice(0, 8) : base.groups
  return {
    title: bi(data.title, base.title, SHORT),
    subtitle: bi(data.subtitle, base.subtitle, MEDIUM),
    mastery: bi(data.mastery, base.mastery, SHORT),
    groups: uniqueIds(
      groups.map((group, groupIndex): ToolGroup => {
        const fallbackGroup = base.groups[groupIndex]
        const src = isRecord(group) ? group : {}
        const tools = Array.isArray(src.tools) ? src.tools.slice(0, 16) : (fallbackGroup?.tools ?? [])
        return {
          id: cleanId(src.id, fallbackGroup?.id ?? `group-${groupIndex + 1}`),
          name: bi(src.name, fallbackGroup?.name ?? { es: "Grupo", en: "Group" }, SHORT),
          tools: uniqueIds(
            tools.map((tool, toolIndex): ToolItem => {
              const fallbackTool = fallbackGroup?.tools[toolIndex]
              const toolSrc = isRecord(tool) ? tool : {}
              return {
                id: cleanId(toolSrc.id, fallbackTool?.id ?? `tool-${groupIndex + 1}-${toolIndex + 1}`),
                name: bi(toolSrc.name, fallbackTool?.name ?? { es: "", en: "" }, SHORT),
                category: bi(toolSrc.category, fallbackTool?.category ?? { es: "", en: "" }, SHORT),
                proficiency: percent(toolSrc.proficiency, fallbackTool?.proficiency ?? 50),
                icon: toolIcon(toolSrc.icon, fallbackTool?.icon ?? { type: "lucide", name: "wrench" satisfies LucideTool }, mode, errors),
              }
            }),
            "tool",
          ),
        }
      }),
      "group",
    ),
  }
}

function sanitizeMissions(data: Record<string, unknown>, base: MissionsContent, mode: Mode, errors: string[]): MissionsContent {
  const quests = Array.isArray(data.quests) ? data.quests.slice(0, 12) : base.quests
  const socials = Array.isArray(data.socials) ? data.socials.slice(0, 12) : base.socials
  return {
    title: bi(data.title, base.title, SHORT),
    subtitle: bi(data.subtitle, base.subtitle, MEDIUM),
    accept: bi(data.accept, base.accept, SHORT),
    rewardLabel: bi(data.rewardLabel, base.rewardLabel, SHORT),
    requirementsLabel: bi(data.requirementsLabel, base.requirementsLabel, SHORT),
    findMe: bi(data.findMe, base.findMe, SHORT),
    completeForm: bi(data.completeForm, base.completeForm, MEDIUM),
    nameLabel: bi(data.nameLabel, base.nameLabel, SHORT),
    namePlaceholder: bi(data.namePlaceholder, base.namePlaceholder, SHORT),
    emailLabel: bi(data.emailLabel, base.emailLabel, SHORT),
    emailPlaceholder: bi(data.emailPlaceholder, base.emailPlaceholder, SHORT),
    cancel: bi(data.cancel, base.cancel, SHORT),
    send: bi(data.send, base.send, SHORT),
    describeProject: bi(data.describeProject, base.describeProject, SHORT),
    describePosition: bi(data.describePosition, base.describePosition, SHORT),
    linkGame: bi(data.linkGame, base.linkGame, SHORT),
    messagePlaceholder: bi(data.messagePlaceholder, base.messagePlaceholder, SHORT),
    difficultyEasy: bi(data.difficultyEasy, base.difficultyEasy, SHORT),
    difficultyNormal: bi(data.difficultyNormal, base.difficultyNormal, SHORT),
    difficultyLegendary: bi(data.difficultyLegendary, base.difficultyLegendary, SHORT),
    quests: uniqueIds(
      quests.map((quest, index): Quest => {
        const fallback = base.quests[index]
        const src = isRecord(quest) ? quest : {}
        return {
          id: cleanId(src.id, fallback?.id ?? `quest-${index + 1}`),
          kind: oneOf<QuestKind>(src.kind, QUEST_KINDS, fallback?.kind ?? "feedback"),
          difficulty: oneOf<Difficulty>(src.difficulty, DIFFICULTIES, fallback?.difficulty ?? "normal"),
          title: bi(src.title, fallback?.title ?? { es: "", en: "" }, SHORT),
          description: bi(src.description, fallback?.description ?? { es: "", en: "" }, LONG),
          requirements: bi(src.requirements, fallback?.requirements ?? { es: "", en: "" }, MEDIUM),
          reward: bi(src.reward, fallback?.reward ?? { es: "", en: "" }, MEDIUM),
        }
      }),
      "quest",
    ),
    socials: uniqueIds(
      socials.map((social, index): SocialLink => {
        const fallback = base.socials[index]
        const src = isRecord(social) ? social : {}
        const name = str(src.name, fallback?.name ?? "", SHORT)
        return {
          id: cleanId(src.id, fallback?.id ?? `social-${index + 1}`),
          name,
          href: hrefOf(src.href, fallback?.href ?? "", mode, plainText(name).slice(0, 80), errors),
          icon: oneOf<SocialIcon>(src.icon, SOCIAL_ICONS, fallback?.icon ?? "mail"),
        }
      }),
      "social",
    ),
  }
}

export function sanitizeSection<K extends SectionKey>(key: K, data: unknown, mode: Mode = "read"): SanitizeResult<SiteContent[K]> {
  if (!isRecord(data)) {
    return { ok: false, error: "No se pudo leer la sección." }
  }
  const errors: string[] = []
  const base = defaultSiteContent[key]
  let value: SiteContent[K]
  if (key === "home") value = sanitizeHome(data, base as HomeContent) as SiteContent[K]
  else if (key === "about") value = sanitizeAbout(data, base as AboutContent) as SiteContent[K]
  else if (key === "experience") value = sanitizeExperience(data, base as ExperienceContent) as SiteContent[K]
  else if (key === "tools") value = sanitizeTools(data, base as ToolsContent, mode, errors) as SiteContent[K]
  else value = sanitizeMissions(data, base as MissionsContent, mode, errors) as SiteContent[K]

  if (mode === "write" && errors.length > 0) return { ok: false, error: errors[0] }
  return { ok: true, value }
}

export function mergeStoredContent(rows: { key: string; data: unknown }[]): SiteContent {
  const next: SiteContent = structuredClone(defaultSiteContent)
  for (const row of rows) {
    switch (row.key) {
      case "home": {
        const result = sanitizeSection("home", row.data, "read")
        if (result.ok) next.home = result.value
        break
      }
      case "about": {
        const result = sanitizeSection("about", row.data, "read")
        if (result.ok) next.about = result.value
        break
      }
      case "experience": {
        const result = sanitizeSection("experience", row.data, "read")
        if (result.ok) next.experience = result.value
        break
      }
      case "tools": {
        const result = sanitizeSection("tools", row.data, "read")
        if (result.ok) next.tools = result.value
        break
      }
      case "missions": {
        const result = sanitizeSection("missions", row.data, "read")
        if (result.ok) next.missions = result.value
        break
      }
      default:
        break
    }
  }
  return next
}
