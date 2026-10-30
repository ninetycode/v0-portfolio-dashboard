export type Lang = "es" | "en"

export type Bilingual = { es: string; en: string }

export const SECTION_KEYS = ["home", "about", "experience", "tools", "missions"] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const ABOUT_ICONS = ["gamepad", "code", "target", "trophy"] as const
export type AboutIcon = (typeof ABOUT_ICONS)[number]

export type AboutStat = {
  id: string
  icon: AboutIcon
  useGameCount: boolean
  title: Bilingual
  countSuffix: Bilingual
  description: Bilingual
}

export type AboutContent = {
  label: Bilingual
  titlePart1: Bilingual
  titleYear: string
  paragraphs: Bilingual[]
  stats: AboutStat[]
}

export const EXPERIENCE_TYPES = ["work", "project", "milestone"] as const
export type ExperienceType = (typeof EXPERIENCE_TYPES)[number]

export type ExperienceItem = {
  id: string
  year: string
  type: ExperienceType
  title: Bilingual
  company: Bilingual
  overview: Bilingual
  highlights: Bilingual[]
  showReadMore: boolean
}

export type ExperienceContent = {
  title: Bilingual
  subtitle: Bilingual
  typeWork: Bilingual
  typeProject: Bilingual
  typeMilestone: Bilingual
  achievements: Bilingual
  readMore: Bilingual
  selectPrompt: Bilingual
  items: ExperienceItem[]
}

export const LUCIDE_TOOLS = ["book", "table", "wrench", "code", "git"] as const
export type LucideTool = (typeof LUCIDE_TOOLS)[number]

export type ToolIcon = { type: "brand"; slug: string } | { type: "lucide"; name: LucideTool }

export type ToolItem = {
  id: string
  name: Bilingual
  category: Bilingual
  proficiency: number
  icon: ToolIcon
}

export type ToolGroup = {
  id: string
  name: Bilingual
  tools: ToolItem[]
}

export type ToolsContent = {
  title: Bilingual
  subtitle: Bilingual
  mastery: Bilingual
  groups: ToolGroup[]
}

export const QUEST_KINDS = ["feedback", "hire", "playtest", "interview"] as const
export type QuestKind = (typeof QUEST_KINDS)[number]

export const DIFFICULTIES = ["easy", "normal", "legendary"] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const SOCIAL_ICONS = ["linkedin", "itch", "mail", "github", "instagram", "youtube", "x"] as const
export type SocialIcon = (typeof SOCIAL_ICONS)[number]

export type Quest = {
  id: string
  kind: QuestKind
  difficulty: Difficulty
  title: Bilingual
  description: Bilingual
  requirements: Bilingual
  reward: Bilingual
}

export type SocialLink = {
  id: string
  name: string
  href: string
  icon: SocialIcon
}

export type MissionsContent = {
  title: Bilingual
  subtitle: Bilingual
  accept: Bilingual
  rewardLabel: Bilingual
  requirementsLabel: Bilingual
  findMe: Bilingual
  completeForm: Bilingual
  nameLabel: Bilingual
  namePlaceholder: Bilingual
  emailLabel: Bilingual
  emailPlaceholder: Bilingual
  cancel: Bilingual
  send: Bilingual
  describeProject: Bilingual
  describePosition: Bilingual
  linkGame: Bilingual
  messagePlaceholder: Bilingual
  difficultyEasy: Bilingual
  difficultyNormal: Bilingual
  difficultyLegendary: Bilingual
  quests: Quest[]
  socials: SocialLink[]
}

export type HomeContent = {
  badge: Bilingual
  level: string
  title1: Bilingual
  title2: Bilingual
  title3: Bilingual
  subtitle: Bilingual
  classLabel: Bilingual
  spec: Bilingual
  region: Bilingual
  ctaGames: Bilingual
  ctaProjects: Bilingual
  ctaContact: Bilingual
  scrollDown: Bilingual
  objectiveLabel: Bilingual
  objectiveValue: Bilingual
  locationLabel: Bilingual
  locationValue: Bilingual
  footerCredit: Bilingual
  footerName: Bilingual
  footerTagline: Bilingual
  featuredKicker: Bilingual
  featuredTitle: Bilingual
  featuredSubtitle: Bilingual
  featuredEmpty: Bilingual
  featuredSeeAll: Bilingual
}

export type SiteContent = {
  home: HomeContent
  about: AboutContent
  experience: ExperienceContent
  tools: ToolsContent
  missions: MissionsContent
}
