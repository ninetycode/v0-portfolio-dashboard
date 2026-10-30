import { unstable_noStore as noStore } from "next/cache"
import { db, pool } from "@/lib/db"
import { siteSections } from "@/lib/db/schema"
import { defaultSiteContent } from "./defaults"
import { mergeStoredContent, sanitizeSection } from "./sanitize"
import type { SectionKey, SiteContent } from "./types"

let ensuring: Promise<void> | null = null

function ensureTable(): Promise<void> {
  if (!ensuring) {
    ensuring = pool
      .query(
        `CREATE TABLE IF NOT EXISTS site_sections (
          key text PRIMARY KEY,
          data jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )`,
      )
      .then(() => undefined)
      .catch((error: unknown) => {
        ensuring = null
        throw error
      })
  }
  return ensuring
}

export async function readSiteContent(): Promise<SiteContent> {
  noStore()
  if (!process.env.DATABASE_URL) return structuredClone(defaultSiteContent)
  try {
    await ensureTable()
    const rows = await db.select({ key: siteSections.key, data: siteSections.data }).from(siteSections)
    return mergeStoredContent(rows)
  } catch {
    console.error("[site-content] no se pudo leer el contenido")
    return structuredClone(defaultSiteContent)
  }
}

export async function writeSiteSection(key: SectionKey, data: unknown): Promise<{ success: true } | { success: false; error: string }> {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: "No hay base de datos configurada (DATABASE_URL)." }
  }
  const sanitized = sanitizeSection(key, data, "write")
  if (!sanitized.ok) return { success: false, error: sanitized.error }
  try {
    await ensureTable()
    const payload = sanitized.value as unknown as Record<string, unknown>
    await db
      .insert(siteSections)
      .values({ key, data: payload, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSections.key,
        set: { data: payload, updatedAt: new Date() },
      })
    return { success: true }
  } catch {
    console.error("[site-content] no se pudo guardar", key)
    return { success: false, error: "No se pudo guardar. Revisa la conexión a la base de datos." }
  }
}
