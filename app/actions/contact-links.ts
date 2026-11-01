"use server"

import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/admin-auth"
import type { ContactLinksContent } from "@/lib/site-content/contact-links"
import { writeContactLinks } from "@/lib/site-content/contact-links-store"

export async function saveContactLinks(
  data: unknown,
): Promise<{ success: true; data: ContactLinksContent } | { success: false; error: string }> {
  if (!(await isAdmin())) return { success: false, error: "No autorizado." }
  const result = await writeContactLinks(data)
  if (!result.success) return result
  revalidatePath("/contactos")
  revalidatePath("/contactos/editor")
  revalidatePath("/contactos/stats")
  return result
}
