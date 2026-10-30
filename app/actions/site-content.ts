"use server"

import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/admin-auth"
import { readSiteContent, writeSiteSection } from "@/lib/site-content/store"
import { isSectionKey } from "@/lib/site-content/sections"
import type { SiteContent } from "@/lib/site-content/types"

export async function getSiteContent(): Promise<SiteContent> {
  return readSiteContent()
}

export async function saveSiteSection(
  key: string,
  data: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!(await isAdmin())) return { success: false, error: "No autorizado." }
  if (!isSectionKey(key)) return { success: false, error: "Sección desconocida." }
  const result = await writeSiteSection(key, data)
  if (result.success) revalidatePath("/", "layout")
  return result
}
