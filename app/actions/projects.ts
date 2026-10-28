"use server"

import { revalidatePath } from "next/cache"
import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { projects, type ProjectRow } from "@/lib/db/schema"
import { isAdmin } from "@/lib/admin-auth"
import { slugify, uniqueTags } from "@/lib/games-options"
import {
  DEFAULT_PROJECT_CATEGORIES,
  DEFAULT_PROJECT_PLATFORMS,
  isProjectStatus,
  toProjectEmbed,
  type Project,
  type ProjectInput,
} from "@/lib/projects-types"

type ActionResult = { success: true } | { success: false; error: string }

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized")
}

function revalidateProjects(slug?: string) {
  revalidatePath("/proyectos")
  if (slug) revalidatePath(`/proyectos/${slug}`)
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description,
    status: isProjectStatus(row.status) ? row.status : "idea",
    categories: row.categories,
    platforms: row.platforms,
    tags: row.tags,
    projectDate: row.projectDate,
    coverImage: row.coverImage,
    screenshots: row.screenshots,
    embedUrl: row.embedUrl,
    embedWidth: row.embedWidth,
    embedHeight: row.embedHeight,
    externalUrl: row.externalUrl,
    resources: row.resources,
    sortOrder: row.sortOrder,
  }
}

export async function getProjects(): Promise<Project[]> {
  const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.createdAt))
  return rows.map(toProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)
  return rows[0] ? toProject(rows[0]) : null
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  return rows[0] ? toProject(rows[0]) : null
}

export async function getProjectTaxonomy() {
  const rows = await db.select({ categories: projects.categories, platforms: projects.platforms, tags: projects.tags }).from(projects)
  return {
    categories: uniqueTags([...rows.flatMap((r) => r.categories), ...DEFAULT_PROJECT_CATEGORIES]),
    platforms: uniqueTags([...DEFAULT_PROJECT_PLATFORMS, ...rows.flatMap((r) => r.platforms)]),
    tags: uniqueTags(rows.flatMap((r) => r.tags)),
  }
}

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value)
const isImageSrc = (value: string) => isHttpUrl(value) || /^\/[\w\-./]+$/.test(value)

function cleanInput(input: ProjectInput) {
  const url = (value: string) => {
    const trimmed = value.trim().slice(0, 1000)
    return isHttpUrl(trimmed) ? trimmed : null
  }
  const image = (value: string) => {
    const trimmed = value.trim().slice(0, 1000)
    return isImageSrc(trimmed) ? trimmed : null
  }
  const tags = (values: string[]) => uniqueTags(values.map((v) => v.trim().slice(0, 40))).slice(0, 12)
  const embed = input.embedUrl.trim() ? toProjectEmbed(input.embedUrl) : null
  return {
    title: input.title.trim().slice(0, 160),
    slug: slugify(input.slug),
    shortDescription: input.shortDescription.trim().slice(0, 500),
    description: input.description.trim().slice(0, 10000),
    status: isProjectStatus(input.status) ? input.status : "idea",
    categories: tags(input.categories),
    platforms: tags(input.platforms),
    tags: tags(input.tags),
    projectDate: input.projectDate.trim().slice(0, 40),
    coverImage: image(input.coverImage),
    screenshots: uniqueTags(input.screenshots.map((v) => v.trim()).filter(isImageSrc)).slice(0, 12),
    embedUrl: embed ? url(embed.url) : null,
    embedWidth: Math.max(320, Math.min(2400, Number(embed?.width ?? input.embedWidth) || 1280)),
    embedHeight: Math.max(240, Math.min(1600, Number(embed?.height ?? input.embedHeight) || 740)),
    externalUrl: url(input.externalUrl),
    resources: input.resources
      .map((r) => ({ type: r.type.trim().slice(0, 40) || "Documento", label: r.label.trim().slice(0, 100), url: r.url.trim().slice(0, 1000) }))
      .filter((r) => r.label && isHttpUrl(r.url))
      .slice(0, 12),
  }
}

function validate(data: ReturnType<typeof cleanInput>): string | null {
  if (!data.title) return "Falta el título."
  if (!data.slug) return "Falta el slug (URL del proyecto)."
  return null
}

export async function createProject(input: ProjectInput): Promise<ActionResult & { slug?: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const data = cleanInput(input)
  const invalid = validate(data)
  if (invalid) return { success: false, error: invalid }
  const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, data.slug)).limit(1)
  if (existing[0]) return { success: false, error: `Ya existe un proyecto con el slug "${data.slug}". Cámbialo.` }
  try {
    const last = await db.select({ sortOrder: projects.sortOrder }).from(projects)
    const sortOrder = last.reduce((max, r) => Math.max(max, r.sortOrder + 1), 0)
    await db.insert(projects).values({ ...data, sortOrder })
    revalidateProjects(data.slug)
    return { success: true, slug: data.slug }
  } catch {
    return { success: false, error: "No se pudo crear el proyecto." }
  }
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult & { slug?: string }> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const data = cleanInput(input)
  const invalid = validate(data)
  if (invalid) return { success: false, error: invalid }
  const clash = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, data.slug)).limit(1)
  if (clash[0] && clash[0].id !== id) return { success: false, error: `Ya existe otro proyecto con el slug "${data.slug}".` }
  try {
    const old = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, id)).limit(1)
    await db.update(projects).set(data).where(eq(projects.id, id))
    revalidateProjects(old[0]?.slug)
    revalidateProjects(data.slug)
    return { success: true, slug: data.slug }
  } catch {
    return { success: false, error: "No se pudo guardar el proyecto." }
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ slug: projects.slug })
  revalidateProjects(deleted[0]?.slug)
  return { success: true }
}

export async function reorderProjects(orderedIds: string[]): Promise<ActionResult> {
  try { await requireAdmin() } catch { return { success: false, error: "No autorizado." } }
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx.update(projects).set({ sortOrder: index }).where(eq(projects.id, id))
    }
  })
  revalidateProjects()
  return { success: true }
}
