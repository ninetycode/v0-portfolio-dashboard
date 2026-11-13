"use server"

import { isAdmin } from "@/lib/admin-auth"
import { db, pool } from "@/lib/db"
import { blogPosts, blogTags, type BlogPostRow } from "@/lib/db/schema"
import { DEFAULT_BLOG_TAGS } from "@/lib/blog-data"
import { uniqueTags } from "@/lib/games-options"
import { asc, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

let ensuringSchema: Promise<void> | null = null

async function ensureBlogSchema(): Promise<void> {
  if (!process.env.DATABASE_URL) return
  if (!ensuringSchema) {
    ensuringSchema = (async () => {
      await pool.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0`)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blog_tags (
          name text PRIMARY KEY,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
    })().catch((error: unknown) => {
      ensuringSchema = null
      throw error
    })
  }
  return ensuringSchema
}

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("No autorizado: se requiere sesión de administrador")
  }
}

export interface BlogPostInput {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  readTime: string
  coverImage?: string | null
  featured: boolean
  publishedAt: string // YYYY-MM-DD
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

async function saveBlogTags(rawTags: string[]): Promise<void> {
  if (!process.env.DATABASE_URL) return
  const cleaned = uniqueTags(rawTags.map((t) => t.trim()).filter(Boolean))
  if (cleaned.length === 0) return

  await ensureBlogSchema()
  const existingRows = await db.select({ name: blogTags.name }).from(blogTags)
  const existingKeys = new Set([
    ...DEFAULT_BLOG_TAGS.map((t) => t.toLowerCase()),
    ...existingRows.map((r) => r.name.trim().toLowerCase()),
  ])

  const toInsert = cleaned.filter((tag) => !existingKeys.has(tag.toLowerCase()))
  if (toInsert.length === 0) return

  await db
    .insert(blogTags)
    .values(toInsert.map((name) => ({ name })))
    .onConflictDoNothing()
}

export async function getBlogTagOptions(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [...DEFAULT_BLOG_TAGS]
  try {
    await ensureBlogSchema()
    const [savedRows, postRows] = await Promise.all([
      db.select({ name: blogTags.name }).from(blogTags).orderBy(asc(blogTags.createdAt)),
      db.select({ tags: blogPosts.tags }).from(blogPosts),
    ])
    const savedNames = savedRows.map((r) => r.name)
    const usedInPosts = postRows.flatMap((r) => r.tags)
    return uniqueTags([...DEFAULT_BLOG_TAGS, ...savedNames, ...usedInPosts])
  } catch {
    return [...DEFAULT_BLOG_TAGS]
  }
}

export async function registerBlogTag(tag: string): Promise<{ success: boolean }> {
  try {
    await requireAdmin()
    await saveBlogTags([tag])
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function recordPostView(slug: string): Promise<boolean> {
  if (!process.env.DATABASE_URL || !slug.trim()) return false
  try {
    await ensureBlogSchema()
    const updated = await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.slug, slug.trim()))
      .returning({ id: blogPosts.id })
    return updated.length > 0
  } catch {
    return false
  }
}

export async function getAllPosts(): Promise<BlogPostRow[]> {
  if (!process.env.DATABASE_URL) return []
  await ensureBlogSchema()
  return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt))
}

export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  await ensureBlogSchema()
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getPostById(id: string): Promise<BlogPostRow | null> {
  await ensureBlogSchema()
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)
  return rows[0] ?? null
}

export async function createPost(input: BlogPostInput): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    await requireAdmin()
    await ensureBlogSchema()
    const slug = slugify(input.slug) || slugify(input.title)
    if (!input.title.trim()) {
      return { success: false, error: "El título es obligatorio" }
    }
    if (!slug) {
      return { success: false, error: "El slug (URL) es obligatorio" }
    }
    const existing = await getPostBySlug(slug)
    if (existing) {
      return { success: false, error: `Ya existe una entrada con el slug "${slug}"` }
    }
    const cleanTags = uniqueTags(input.tags.map((t) => t.trim()).filter(Boolean))
    await db.insert(blogPosts).values({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      tags: cleanTags,
      readTime: input.readTime,
      coverImage: input.coverImage ?? null,
      featured: input.featured,
      publishedAt: input.publishedAt,
    })
    await saveBlogTags(cleanTags)
    revalidatePath("/blog")
    revalidatePath("/")
    return { success: true, slug }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear la entrada" }
  }
}

export async function updatePost(
  id: string,
  input: BlogPostInput,
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    await requireAdmin()
    await ensureBlogSchema()
    const slug = slugify(input.slug) || slugify(input.title)
    if (!input.title.trim()) {
      return { success: false, error: "El título es obligatorio" }
    }
    if (!slug) {
      return { success: false, error: "El slug (URL) es obligatorio" }
    }
    // Check slug collision with another post
    const existing = await getPostBySlug(slug)
    if (existing && existing.id !== id) {
      return { success: false, error: `Ya existe otra entrada con el slug "${slug}"` }
    }
    const previous = await getPostById(id)
    if (previous && previous.slug !== slug) revalidatePath(`/blog/${previous.slug}`)
    const cleanTags = uniqueTags(input.tags.map((t) => t.trim()).filter(Boolean))
    await db
      .update(blogPosts)
      .set({
        slug,
        title: input.title.trim(),
        excerpt: input.excerpt,
        content: input.content,
        category: input.category,
        tags: cleanTags,
        readTime: input.readTime,
        coverImage: input.coverImage ?? null,
        featured: input.featured,
        publishedAt: input.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
    await saveBlogTags(cleanTags)
    revalidatePath("/blog")
    revalidatePath(`/blog/${slug}`)
    revalidatePath("/")
    return { success: true, slug }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al actualizar la entrada" }
  }
}

export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await ensureBlogSchema()
    const deleted = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning({ slug: blogPosts.slug })
    if (deleted[0]) revalidatePath(`/blog/${deleted[0].slug}`)
    revalidatePath("/blog")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar la entrada" }
  }
}
