import type { BlogPostRow } from "@/lib/db/schema"
import type { BlogPost } from "@/lib/blog-data"

const DEFAULT_AUTHOR = {
  name: "Mathías Andino",
  avatar: "/profile-avatar.jpg",
  role: "Technical Game Designer",
}

/** Formats a YYYY-MM-DD date into Spanish long form, e.g. "15 de noviembre de 2024" */
export function formatDateEs(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, (m || 1) - 1, d || 1)
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
}

/** Maps a database row to the BlogPost shape used across the UI */
export function rowToPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: formatDateEs(row.publishedAt),
    readTime: row.readTime,
    category: row.category,
    tags: row.tags,
    author: DEFAULT_AUTHOR,
    featured: row.featured,
    color: row.color,
  }
}
