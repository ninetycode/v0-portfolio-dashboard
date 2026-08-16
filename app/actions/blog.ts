"use server"

import { isAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { blogPosts, type BlogPostRow } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

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
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80)
}

export async function getAllPosts(): Promise<BlogPostRow[]> {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt))
}

export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function createPost(input: BlogPostInput): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    await requireAdmin()
    const slug = input.slug.trim() || slugify(input.title)
    if (!slug || !input.title.trim()) {
      return { success: false, error: "El título es obligatorio" }
    }
    const existing = await getPostBySlug(slug)
    if (existing) {
      return { success: false, error: `Ya existe una entrada con el slug "${slug}"` }
    }
    await db.insert(blogPosts).values({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      tags: input.tags,
      readTime: input.readTime,
      coverImage: input.coverImage ?? null,
      featured: input.featured,
      publishedAt: input.publishedAt,
    })
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
    const slug = input.slug.trim() || slugify(input.title)
    if (!slug || !input.title.trim()) {
      return { success: false, error: "El título es obligatorio" }
    }
    // Check slug collision with another post
    const existing = await getPostBySlug(slug)
    if (existing && existing.id !== id) {
      return { success: false, error: `Ya existe otra entrada con el slug "${slug}"` }
    }
    await db
      .update(blogPosts)
      .set({
        slug,
        title: input.title.trim(),
        excerpt: input.excerpt,
        content: input.content,
        category: input.category,
        tags: input.tags,
        readTime: input.readTime,
        coverImage: input.coverImage ?? null,
        featured: input.featured,
        publishedAt: input.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
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
    await db.delete(blogPosts).where(eq(blogPosts.id, id))
    revalidatePath("/blog")
    revalidatePath("/")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar la entrada" }
  }
}
