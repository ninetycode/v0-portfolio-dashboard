import { cache } from "react"
import { unstable_noStore as noStore } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSections } from "@/lib/db/schema"
import {
  CONTACT_LINKS_KEY,
  defaultContactLinks,
  sanitizeContactLinks,
  type ContactLinksContent,
} from "./contact-links"
import { ensureSiteSectionsTable } from "./store"

export const readContactLinks = cache(async (): Promise<ContactLinksContent> => {
  noStore()
  if (!process.env.DATABASE_URL) return structuredClone(defaultContactLinks)
  try {
    await ensureSiteSectionsTable()
    const rows = await db
      .select({ data: siteSections.data })
      .from(siteSections)
      .where(eq(siteSections.key, CONTACT_LINKS_KEY))
      .limit(1)
    if (!rows[0]) return structuredClone(defaultContactLinks)
    const parsed = sanitizeContactLinks(rows[0].data, "read")
    return parsed.ok ? parsed.value : structuredClone(defaultContactLinks)
  } catch {
    console.error("[contact-links] no se pudo leer")
    return structuredClone(defaultContactLinks)
  }
})

export async function writeContactLinks(
  data: unknown,
): Promise<{ success: true; data: ContactLinksContent } | { success: false; error: string }> {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: "No hay base de datos configurada (DATABASE_URL)." }
  }
  const sanitized = sanitizeContactLinks(data, "write")
  if (!sanitized.ok) return { success: false, error: sanitized.error }
  try {
    await ensureSiteSectionsTable()
    const payload = sanitized.value as unknown as Record<string, unknown>
    await db
      .insert(siteSections)
      .values({ key: CONTACT_LINKS_KEY, data: payload, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSections.key,
        set: { data: payload, updatedAt: new Date() },
      })
    return { success: true, data: sanitized.value }
  } catch {
    console.error("[contact-links] no se pudo guardar")
    return { success: false, error: "No se pudo guardar. Revisa la conexión a la base de datos." }
  }
}
