"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Pencil, Shield } from "lucide-react"
import { useAdmin } from "@/lib/admin-context"
import { SECTIONS } from "@/lib/site-content/sections"

export function AdminContentBar() {
  const { isAdmin } = useAdmin()
  if (!isAdmin) return null

  return (
    <div className="mb-8 text-left">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <span className="flex items-center gap-2 font-mono text-xs text-primary">
          <Shield className="h-4 w-4" />
          modo_admin
        </span>
        <span className="font-mono text-xs text-muted-foreground">Editar textos</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {SECTIONS.map((section) => (
            <Link
              key={section.key}
              href={`/contenido?seccion=${section.slug}`}
              className="rounded-md border border-primary/30 px-2 py-1 font-mono text-xs text-primary hover:bg-primary/10"
            >
              {section.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminEditShortcut() {
  const { isAdmin } = useAdmin()
  const pathname = usePathname()
  if (!isAdmin || pathname === "/" || pathname.startsWith("/contenido") || pathname.startsWith("/contactos")) return null

  return (
    <Link
      href="/contenido"
      className="fixed top-20 left-4 z-40 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-background/90 px-3 py-2 font-mono text-xs text-primary shadow-sm backdrop-blur-sm hover:bg-primary/10"
    >
      <Pencil className="h-3.5 w-3.5" />
      editar textos
    </Link>
  )
}
